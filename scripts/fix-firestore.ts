import { readdir, readFile, rename, writeFile } from 'fs/promises';
import { join, resolve } from 'path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { z } from 'zod';
import * as fs from 'fs';
import { existsSync, mkdirSync, createWriteStream } from 'fs';
import axios from 'axios';
import { promisify } from 'util';
import { pipeline } from 'stream';

const streamPipeline = promisify(pipeline);

// Configuration
const BUCKET_NAME = 'retropub-7bfe5';
const PLACEHOLDER_URL = 'https://via.placeholder.com/512x384.jpg?text=Placeholder';
const ASSETS_DIR = resolve(__dirname, '../assets');
const PLACEHOLDER_PATH = join(ASSETS_DIR, 'placeholder.jpg');
const SERVICE_ACCOUNT_PATH = resolve(__dirname, '../firebase-admin.json');

// Initialize Firebase Admin
const serviceAccountPath = resolve(__dirname, '../firebase-admin.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ firebase-admin.json not found!');
  process.exit(1);
}

const app = initializeApp({
  credential: cert(require(serviceAccountPath)),
  storageBucket: 'retropub-7bfe5'
});

const db = getFirestore(app);
const storage = getStorage(app);
const bucket = storage.bucket();

// Validation schemas
const timestampFields = {
  createdAt: z.instanceof(Timestamp),
  updatedAt: z.instanceof(Timestamp)
};

const eventSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  date: z.instanceof(Timestamp),
  time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  imageUrl: z.string().url('Invalid image URL'),
  isActive: z.boolean(),
  capacity: z.number().int().positive('Capacity must be positive'),
  price: z.number().optional(),
  ...timestampFields
});

const sectionSchema = z.object({
  heading: z.string().min(1, 'Heading is required'),
  subheading: z.string().min(1, 'Subheading is required'),
  description: z.string().min(1, 'Description is required'),
  imageUrl: z.string().url('Invalid image URL'),
  ...timestampFields
});

const menuItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be positive'),
  category: z.string().min(1, 'Category is required'),
  imageUrl: z.string().url('Invalid image URL').optional(),
  isAvailable: z.boolean(),
  allergens: z.array(z.string()).optional(),
  dietary: z.object({
    isVegetarian: z.boolean(),
    isVegan: z.boolean(),
    isGlutenFree: z.boolean()
  }).optional(),
  ...timestampFields
});

const galleryImageSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  imageUrl: z.string().url('Invalid image URL'),
  categoryId: z.string().min(1, 'Category ID is required'),
  description: z.string().optional(),
  order: z.number().optional(),
  ...timestampFields
});

// Update the FixReport interface with explicit array types
interface FixReport {
  routing: {
    fixed: Array<string>;
    skipped: Array<string>;
    errors: Array<string>;
  };
  collections: {
    [collection: string]: {
      fixed: Array<string>;
      skipped: Array<string>;
      errors: Array<string>;
    };
  };
  images: {
    uploaded: Array<string>;
    invalid: Array<string>;
    errors: Array<string>;
  };
  timestamp: string;
}

// Helper function to download file
async function downloadFile(url: string, outputPath: string): Promise<void> {
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  });

  await streamPipeline(response.data, createWriteStream(outputPath));
}

// Helper function to check and upload placeholder image
async function ensurePlaceholderImage(): Promise<string> {
  const placeholderPath = 'images/placeholder.jpg';
  const localImagePath = resolve(__dirname, '../assets/placeholder.jpg');
  
  // Check if local placeholder exists
  if (!fs.existsSync(localImagePath)) {
    console.error('❌ Local placeholder image not found:', localImagePath);
    throw new Error('Local placeholder image not found');
  }

  try {
    // Check if bucket exists
    const [bucketExists] = await bucket.exists();
    if (!bucketExists) {
      console.error('❌ Firebase Storage bucket does not exist!');
      throw new Error('Storage bucket not found');
    }

    // Check if placeholder already exists
    const [exists] = await bucket.file(placeholderPath).exists();
    
    if (!exists) {
      // Upload placeholder from local
      await bucket.upload(localImagePath, {
        destination: placeholderPath,
        gzip: true,
        metadata: {
          contentType: 'image/jpeg',
          cacheControl: 'public, max-age=31536000'
        }
      });
      console.log('✅ Uploaded placeholder image');
    } else {
      console.log('✅ Placeholder image already exists');
    }

    // Get signed URL
    const [url] = await bucket.file(placeholderPath).getSignedUrl({
      action: 'read',
      expires: '01-01-2100'
    });

    return url;
  } catch (err) {
    console.error('❌ Error with placeholder image:', err);
    throw err;
  }
}

// Check and fix routing
async function checkRouting(report: FixReport) {
  console.log('\n📁 Checking page routing...');
  
  const publicPagesPath = resolve(process.cwd(), 'app/public');
  const expectedPages = ['about', 'menu', 'events', 'gallery', 'contact', 'booking'];

  for (const page of expectedPages) {
    const pagePath = join(publicPagesPath, page);
    try {
      const files = await readdir(pagePath);
      
      const hasPage = files.includes('page.tsx');
      const hasIndex = files.includes('index.tsx');
      const hasPageCaps = files.includes('Page.tsx');

      if (!hasPage) {
        if (hasIndex) {
          await rename(join(pagePath, 'index.tsx'), join(pagePath, 'page.tsx'));
          (report.routing.fixed as Array<string>).push(`${page}/index.tsx → page.tsx`);
        } else if (hasPageCaps) {
          await rename(join(pagePath, 'Page.tsx'), join(pagePath, 'page.tsx'));
          (report.routing.fixed as Array<string>).push(`${page}/Page.tsx → page.tsx`);
        } else {
          (report.routing.skipped as Array<string>).push(`${page} - missing page.tsx`);
        }
      } else {
        (report.routing.skipped as Array<string>).push(`${page} - already correct`);
      }
    } catch (err) {
      const error = `Error checking ${page}: ${err}`;
      console.error('❌', error);
      (report.routing.errors as Array<string>).push(error);
    }
  }
}

// Fix collection documents
async function fixCollection(
  collectionName: string,
  schema: z.ZodObject<any>,
  report: FixReport,
  placeholderUrl: string
) {
  console.log(`\n📄 Fixing collection: ${collectionName}...`);
  
  const collection = report.collections[collectionName] = {
    fixed: [] as Array<string>,
    skipped: [] as Array<string>,
    errors: [] as Array<string>
  };

  try {
    const snapshot = await db.collection(collectionName).get();
    
    for (const doc of snapshot.docs) {
      try {
        const data = doc.data();
        let needsUpdate = false;
        const updates: any = {};

        // Check timestamps
        const now = Timestamp.now();
        if (!data.createdAt) {
          updates.createdAt = now;
          needsUpdate = true;
        }
        if (!data.updatedAt) {
          updates.updatedAt = now;
          needsUpdate = true;
        }

        // Check imageUrl if schema requires it
        if (schema.shape.imageUrl && (!data.imageUrl || !z.string().url().safeParse(data.imageUrl).success)) {
          updates.imageUrl = placeholderUrl;
          needsUpdate = true;
          (report.images.uploaded as Array<string>).push(`${collectionName}/${doc.id}`);
        }

        // Collection-specific fixes
        if (collectionName === 'events') {
          if (!data.capacity || data.capacity <= 0) {
            updates.capacity = 50;
            needsUpdate = true;
          }
          if (!(data.date instanceof Timestamp)) {
            updates.date = Timestamp.fromDate(new Date(data.date));
            needsUpdate = true;
          }
          if (!data.time || !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(data.time)) {
            updates.time = '19:00';
            needsUpdate = true;
          }
        }

        // Validate with schema
        const validationResult = schema.safeParse({ ...data, ...updates });
        if (!validationResult.success) {
          const error = `Validation failed for ${doc.id}: ${validationResult.error.message}`;
          collection.errors.push(error);
          console.error('❌', error);
          continue;
        }

        if (needsUpdate) {
          await doc.ref.update(updates);
          collection.fixed.push(doc.id);
          console.log(`✅ Fixed document: ${doc.id}`);
        } else {
          collection.skipped.push(doc.id);
        }
      } catch (err) {
        const error = `Error processing ${doc.id}: ${err}`;
        collection.errors.push(error);
        console.error('❌', error);
      }
    }
  } catch (err) {
    const error = `Error accessing collection ${collectionName}: ${err}`;
    collection.errors.push(error);
    console.error('❌', error);
  }
}

async function main() {
  console.log('🔧 Starting Firebase Storage setup...\n');

  // 1. Check service account
  try {
    console.log('📄 Checking service account...');
    if (!existsSync(SERVICE_ACCOUNT_PATH)) {
      console.error('❌ firebase-admin.json not found!');
      console.error('Please place your service account key file at:', SERVICE_ACCOUNT_PATH);
      process.exit(1);
    }
    console.log('✅ Service account found');
  } catch (err) {
    console.error('❌ Error checking service account:', err);
    process.exit(1);
  }

  // 2. Initialize Firebase Admin
  try {
    console.log('\n🔥 Initializing Firebase Admin...');
    const app = initializeApp({
      credential: cert(require(SERVICE_ACCOUNT_PATH)),
      storageBucket: BUCKET_NAME
    });
    console.log('✅ Firebase Admin initialized');
  } catch (err) {
    console.error('❌ Error initializing Firebase Admin:', err);
    console.error('Please check your service account credentials');
    process.exit(1);
  }

  // 3. Verify bucket access
  const storage = getStorage();
  const bucket = storage.bucket();

  try {
    console.log('\n🪣 Verifying bucket access...');
    const [exists] = await bucket.exists();
    if (!exists) {
      console.error('❌ Bucket not found:', BUCKET_NAME);
      console.error('Please check your Firebase project settings');
      process.exit(1);
    }
    console.log('✅ Bucket access verified');
  } catch (err) {
    console.error('❌ Error accessing bucket:', err);
    console.error('Please check your Firebase Storage permissions');
    process.exit(1);
  }

  // 4. Check/create assets directory and placeholder
  try {
    console.log('\n📁 Checking assets directory...');
    if (!existsSync(ASSETS_DIR)) {
      mkdirSync(ASSETS_DIR, { recursive: true });
      console.log('✅ Created assets directory');
    }

    if (!existsSync(PLACEHOLDER_PATH)) {
      console.log('⬇️ Downloading placeholder image...');
      await downloadFile(PLACEHOLDER_URL, PLACEHOLDER_PATH);
      console.log('✅ Downloaded placeholder image');
    } else {
      console.log('✅ Placeholder image exists');
    }
  } catch (err) {
    console.error('❌ Error with placeholder image:', err);
    process.exit(1);
  }

  // 5. List bucket contents
  try {
    console.log('\n📋 Listing bucket contents...');
    const [files] = await bucket.getFiles({ prefix: 'images/' });
    
    if (files.length === 0) {
      console.log('No files found in images/ directory');
    } else {
      console.log('Files in images/ directory:');
      files.forEach(file => {
        console.log(`- ${file.name} (${file.metadata.size} bytes)`);
      });
    }
  } catch (err) {
    console.error('❌ Error listing bucket contents:', err);
    console.error('Continuing with upload...');
  }

  // 6. Upload placeholder
  try {
    console.log('\n⬆️ Uploading placeholder image...');
    await bucket.upload(PLACEHOLDER_PATH, {
      destination: 'images/placeholder.jpg',
      gzip: true,
      metadata: {
        cacheControl: 'public, max-age=31536000',
        contentType: 'image/jpeg'
      }
    });
    console.log('✅ Uploaded placeholder image');

    // Get and log the public URL
    const [url] = await bucket.file('images/placeholder.jpg').getSignedUrl({
      action: 'read',
      expires: '01-01-2100'
    });
    console.log('📎 Public URL:', url);

  } catch (err) {
    console.error('❌ Error uploading placeholder:', err);
    process.exit(1);
  }

  console.log('\n✨ All tasks completed successfully!');
}

// Run the script
main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
}); 