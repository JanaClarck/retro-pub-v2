import * as admin from 'firebase-admin';
import * as path from 'path';

// Initialize Firebase Admin
const serviceAccount = require('../service-account-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const Timestamp = admin.firestore.Timestamp;

// Interfaces for document types
interface BaseDocument {
  id: string;
  createdAt: admin.firestore.Timestamp | Date | string;
  updatedAt: admin.firestore.Timestamp | Date | string;
}

interface SectionDocument extends BaseDocument {
  description: string;
  imageUrl?: string;
}

interface EventDocument extends BaseDocument {
  title: string;
  description: string;
  date: string | admin.firestore.Timestamp;
  time: string | admin.firestore.Timestamp;
  imageUrl?: string;
  price: number;
  capacity: number;
  location: string;
  duration: string | number;
  isActive: boolean;
}

interface MenuItem extends BaseDocument {
  name: string;
  category: string;
  description: string;
  price: number;
  imageUrl?: string;
}

interface GalleryItem extends BaseDocument {
  imageUrl: string;
  categoryId: string;
}

interface GalleryCategory extends BaseDocument {
  name: string;
  slug: string;
}

// Migration statistics
interface MigrationStats {
  processed: number;
  skipped: number;
  errors: string[];
}

// Helper function to convert any timestamp-like value to Firestore Timestamp
function normalizeTimestamp(value: any): admin.firestore.Timestamp {
  if (!value) return Timestamp.now();
  
  if (value instanceof admin.firestore.Timestamp) {
    return value;
  }
  
  if (value instanceof Date) {
    return Timestamp.fromDate(value);
  }
  
  if (typeof value === 'string') {
    return Timestamp.fromDate(new Date(value));
  }
  
  if (typeof value === 'number') {
    return Timestamp.fromMillis(value);
  }
  
  return Timestamp.now();
}

// Migrate sections collection
async function migrateSections(): Promise<MigrationStats> {
  console.log('\n🔄 Migrating sections collection...');
  const stats: MigrationStats = { processed: 0, skipped: 0, errors: [] };
  
  try {
    // Migrate menu.description
    const menuDoc = await db.doc('sections/menu.description').get();
    if (menuDoc.exists) {
      const data = menuDoc.data()!;
      await db.doc('sections/menu').set({
        description: data.content,
        imageUrl: data.imageUrl || null,
        updatedAt: normalizeTimestamp(data.updatedAt),
        createdAt: normalizeTimestamp(data.createdAt || Timestamp.now())
      });
      stats.processed++;
      console.log('✓ Migrated menu description');
    }

    // Migrate gallery.description
    const galleryDoc = await db.doc('sections/gallery.description').get();
    if (galleryDoc.exists) {
      const data = galleryDoc.data()!;
      await db.doc('sections/gallery').set({
        description: data.content,
        imageUrl: data.imageUrl || null,
        updatedAt: normalizeTimestamp(data.updatedAt),
        createdAt: normalizeTimestamp(data.createdAt || Timestamp.now())
      });
      stats.processed++;
      console.log('✓ Migrated gallery description');
    }
  } catch (error: any) {
    const errorMsg = `Error migrating sections: ${error?.message || 'Unknown error'}`;
    console.error('❌', errorMsg);
    stats.errors.push(errorMsg);
  }

  return stats;
}

// Migrate collection with timestamp normalization
async function migrateCollection<T extends BaseDocument>(
  collectionName: string,
  validateDocument: (doc: any) => boolean
): Promise<MigrationStats> {
  console.log(`\n🔄 Migrating ${collectionName} collection...`);
  const stats: MigrationStats = { processed: 0, skipped: 0, errors: [] };

  try {
    const snapshot = await db.collection(collectionName).get();
    
    for (const doc of snapshot.docs) {
      try {
        const data = doc.data();
        
        // Validate document
        if (!validateDocument(data)) {
          console.log(`⚠️  Skipping invalid document ${doc.id} in ${collectionName}`);
          stats.skipped++;
          continue;
        }

        // Normalize timestamps
        const updatedData = {
          ...data,
          createdAt: normalizeTimestamp(data.createdAt),
          updatedAt: normalizeTimestamp(data.updatedAt || data.createdAt)
        };

        await doc.ref.set(updatedData, { merge: true });
        stats.processed++;
        
        if (stats.processed % 10 === 0) {
          console.log(`✓ Processed ${stats.processed} documents in ${collectionName}`);
        }
      } catch (error: any) {
        const errorMsg = `Error processing document ${doc.id} in ${collectionName}: ${error?.message || 'Unknown error'}`;
        console.error('❌', errorMsg);
        stats.errors.push(errorMsg);
      }
    }
  } catch (error: any) {
    const errorMsg = `Error migrating ${collectionName}: ${error?.message || 'Unknown error'}`;
    console.error('❌', errorMsg);
    stats.errors.push(errorMsg);
  }

  return stats;
}

// Migrate gallery categories to sections
async function migrateGalleryCategories(): Promise<MigrationStats> {
  console.log('\n🔄 Migrating gallery categories to sections...');
  const stats: MigrationStats = { processed: 0, skipped: 0, errors: [] };

  try {
    const snapshot = await db.collection('galleryCategories').get();
    
    for (const doc of snapshot.docs) {
      try {
        const data = doc.data();
        
        // Validate document
        if (!data.name || !data.slug) {
          console.log(`⚠️  Skipping invalid gallery category ${doc.id}`);
          stats.skipped++;
          continue;
        }

        // Create a subcollection for gallery categories
        await db.doc('sections/gallery').collection('categories').doc(doc.id).set({
          name: data.name,
          slug: data.slug,
          createdAt: normalizeTimestamp(data.createdAt),
          updatedAt: normalizeTimestamp(data.updatedAt || data.createdAt)
        });
        
        stats.processed++;
        console.log(`✓ Migrated gallery category ${doc.id}`);
      } catch (error: any) {
        const errorMsg = `Error migrating gallery category ${doc.id}: ${error?.message || 'Unknown error'}`;
        console.error('❌', errorMsg);
        stats.errors.push(errorMsg);
      }
    }
  } catch (error: any) {
    const errorMsg = `Error migrating gallery categories: ${error?.message || 'Unknown error'}`;
    console.error('❌', errorMsg);
    stats.errors.push(errorMsg);
  }

  return stats;
}

// Validation functions for each collection
const validators = {
  events: (doc: EventDocument) => {
    return !!(doc.title && doc.description && doc.date && doc.time);
  },
  menuItems: (doc: MenuItem) => {
    return !!(doc.name && doc.category && doc.price);
  },
  gallery: (doc: GalleryItem) => {
    return !!(doc.imageUrl && doc.categoryId);
  }
};

// Main migration function
async function migrate() {
  console.log('🚀 Starting Firestore migration...');
  
  const results = {
    sections: await migrateSections(),
    events: await migrateCollection<EventDocument>('events', validators.events),
    menuItems: await migrateCollection<MenuItem>('menuItems', validators.menuItems),
    gallery: await migrateCollection<GalleryItem>('gallery', validators.gallery),
    galleryCategories: await migrateGalleryCategories()
  };

  // Print summary
  console.log('\n📊 Migration Summary:');
  for (const [collection, stats] of Object.entries(results)) {
    console.log(`\n${collection}:`);
    console.log(`- Processed: ${stats.processed}`);
    console.log(`- Skipped: ${stats.skipped}`);
    console.log(`- Errors: ${stats.errors.length}`);
    
    if (stats.errors.length > 0) {
      console.log('\nErrors:');
      stats.errors.forEach(error => console.log(`- ${error}`));
    }
  }
}

// Run migration
migrate()
  .then(() => {
    console.log('\n✅ Migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }); 