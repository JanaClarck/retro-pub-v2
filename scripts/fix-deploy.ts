import { readdir, readFile, rename } from 'fs/promises';
import { join, resolve } from 'path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { z } from 'zod';

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert(resolve(process.cwd(), 'firebase-admin.json'))
});

const db = getFirestore(app);
const storage = getStorage(app);
const bucket = storage.bucket('retropub-7bfe5');

// Validation schemas
const eventSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().min(1),
  date: z.instanceof(Timestamp),
  time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  imageUrl: z.string().url(),
  isActive: z.boolean(),
  capacity: z.number().int().positive(),
  price: z.number().optional()
});

const sectionSchema = z.object({
  heading: z.string().min(1),
  subheading: z.string().min(1),
  description: z.string().min(1),
  imageUrl: z.string().url(),
  createdAt: z.instanceof(Timestamp),
  updatedAt: z.instanceof(Timestamp)
});

interface FixReport {
  routing: {
    fixed: string[];
    skipped: string[];
  };
  events: {
    fixed: string[];
    skipped: string[];
  };
  sections: {
    fixed: string[];
    skipped: string[];
  };
  images: {
    uploaded: string[];
    invalid: string[];
  };
}

async function checkAndFixRouting(): Promise<{ fixed: string[]; skipped: string[] }> {
  const publicPagesPath = resolve(process.cwd(), 'app/public');
  const expectedPages = ['about', 'menu', 'events', 'gallery', 'contact', 'booking'];
  const fixed: string[] = [];
  const skipped: string[] = [];

  for (const page of expectedPages) {
    const pagePath = join(publicPagesPath, page);
    try {
      const files = await readdir(pagePath);
      
      // Check for incorrect file names
      const hasPage = files.includes('page.tsx');
      const hasIndex = files.includes('index.tsx');
      const hasPageCaps = files.includes('Page.tsx');

      if (!hasPage) {
        if (hasIndex) {
          await rename(
            join(pagePath, 'index.tsx'),
            join(pagePath, 'page.tsx')
          );
          fixed.push(`${page}/index.tsx → page.tsx`);
        } else if (hasPageCaps) {
          await rename(
            join(pagePath, 'Page.tsx'),
            join(pagePath, 'page.tsx')
          );
          fixed.push(`${page}/Page.tsx → page.tsx`);
        } else {
          skipped.push(`${page} - missing page.tsx`);
        }
      } else {
        skipped.push(`${page} - already correct`);
      }
    } catch (err) {
      console.error(`Error checking ${page}:`, err);
      skipped.push(`${page} - error checking`);
    }
  }

  return { fixed, skipped };
}

async function uploadPlaceholderImage(path: string): Promise<string> {
  const placeholderPath = resolve(process.cwd(), 'public/placeholder.jpg');
  const destination = path;

  try {
    await bucket.upload(placeholderPath, {
      destination,
      metadata: {
        contentType: 'image/jpeg'
      }
    });

    const [url] = await bucket.file(destination).getSignedUrl({
      action: 'read',
      expires: '01-01-2100'
    });

    return url;
  } catch (err) {
    console.error(`Error uploading placeholder to ${path}:`, err);
    throw err;
  }
}

async function fixEvents(): Promise<{ fixed: string[]; skipped: string[] }> {
  const fixed: string[] = [];
  const skipped: string[] = [];

  const eventsRef = db.collection('events');
  const snapshot = await eventsRef.get();

  for (const doc of snapshot.docs) {
    try {
      const data = doc.data();
      let needsUpdate = false;
      const updates: any = {};

      // Check capacity
      if (!data.capacity || data.capacity <= 0) {
        updates.capacity = 50;
        needsUpdate = true;
      }

      // Check imageUrl
      if (!data.imageUrl || !z.string().url().safeParse(data.imageUrl).success) {
        const imagePath = `public/events/${doc.id}.jpg`;
        updates.imageUrl = await uploadPlaceholderImage(imagePath);
        needsUpdate = true;
      }

      // Check date and time
      if (!(data.date instanceof Timestamp)) {
        updates.date = Timestamp.fromDate(new Date(data.date));
        needsUpdate = true;
      }

      if (!data.time || !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(data.time)) {
        updates.time = '19:00';
        needsUpdate = true;
      }

      if (needsUpdate) {
        await eventsRef.doc(doc.id).update(updates);
        fixed.push(doc.id);
      } else {
        skipped.push(doc.id);
      }
    } catch (err) {
      console.error(`Error fixing event ${doc.id}:`, err);
      skipped.push(`${doc.id} - error`);
    }
  }

  return { fixed, skipped };
}

async function fixSections(): Promise<{ fixed: string[]; skipped: string[] }> {
  const fixed: string[] = [];
  const skipped: string[] = [];
  const sectionsToCheck = ['hero', 'interior', 'about'];

  for (const sectionId of sectionsToCheck) {
    try {
      const docRef = db.collection('sections').doc(sectionId);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        skipped.push(`${sectionId} - does not exist`);
        continue;
      }

      const data = doc.data()!;
      let needsUpdate = false;
      const updates: any = {};

      // Check timestamps
      if (!data.createdAt || !data.updatedAt) {
        const now = Timestamp.now();
        updates.createdAt = now;
        updates.updatedAt = now;
        needsUpdate = true;
      }

      // Check imageUrl
      if (!data.imageUrl || !z.string().url().safeParse(data.imageUrl).success) {
        const imagePath = `public/sections/${sectionId}.jpg`;
        updates.imageUrl = await uploadPlaceholderImage(imagePath);
        needsUpdate = true;
      }

      // Check required fields
      if (!data.heading || !data.subheading || !data.description) {
        updates.heading = data.heading || `${sectionId.charAt(0).toUpperCase()}${sectionId.slice(1)}`;
        updates.subheading = data.subheading || 'Welcome to Retro Pub';
        updates.description = data.description || 'Experience the best of traditional pub culture.';
        needsUpdate = true;
      }

      if (needsUpdate) {
        await docRef.update(updates);
        fixed.push(sectionId);
      } else {
        skipped.push(sectionId);
      }
    } catch (err) {
      console.error(`Error fixing section ${sectionId}:`, err);
      skipped.push(`${sectionId} - error`);
    }
  }

  return { fixed, skipped };
}

async function main() {
  console.log('🔧 Starting deployment fixes...\n');

  const report: FixReport = {
    routing: { fixed: [], skipped: [] },
    events: { fixed: [], skipped: [] },
    sections: { fixed: [], skipped: [] },
    images: { uploaded: [], invalid: [] }
  };

  // Fix routing
  console.log('📁 Checking page routing...');
  report.routing = await checkAndFixRouting();
  
  // Fix events
  console.log('\n🎫 Fixing events...');
  report.events = await fixEvents();
  
  // Fix sections
  console.log('\n📄 Fixing sections...');
  report.sections = await fixSections();

  // Output report
  console.log('\n📊 Fix Report:');
  console.log(JSON.stringify(report, null, 2));

  console.log('\n✅ Deployment fixes completed!');
}

main().catch(console.error); 