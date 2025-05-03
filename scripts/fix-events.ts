import * as admin from 'firebase-admin';
import { parse, isValid } from 'date-fns';

// Initialize Firebase Admin
const serviceAccount = require('../service-account-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Constants
const FALLBACK_IMAGE_URL = 'https://firebasestorage.googleapis.com/v0/b/retropub-7bfe5.appspot.com/o/placeholder-event.jpg?alt=media';

// Types
interface Event {
  title: string;
  description: string;
  date: admin.firestore.Timestamp | string;
  time: string;
  imageUrl?: string;
  isActive: boolean;
}

interface MigrationSummary {
  total: number;
  updated: number;
  skipped: number;
  failed: number;
  updatedDocs: Array<{ id: string; changes: string[] }>;
  failedDocs: Array<{ id: string; error: string }>;
}

// Helper functions
function parseDateTime(dateStr: string, timeStr: string): Date | null {
  // Try different date formats
  const formats = [
    'yyyy-MM-dd',
    'MM/dd/yyyy',
    'dd/MM/yyyy',
    'yyyy/MM/dd'
  ];

  for (const format of formats) {
    const datePart = parse(dateStr, format, new Date());
    if (isValid(datePart)) {
      // Parse time (HH:mm)
      const [hours, minutes] = timeStr.split(':').map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        datePart.setHours(hours, minutes);
        return datePart;
      }
    }
  }

  return null;
}

function isValidTimestamp(value: any): boolean {
  return value instanceof admin.firestore.Timestamp;
}

// Main migration function
async function migrateEvents(): Promise<MigrationSummary> {
  console.log('🚀 Starting events migration...\n');

  const summary: MigrationSummary = {
    total: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
    updatedDocs: [],
    failedDocs: []
  };

  try {
    const eventsSnapshot = await db.collection('events').get();
    summary.total = eventsSnapshot.size;

    for (const doc of eventsSnapshot.docs) {
      const data = doc.data() as Event;
      const changes: string[] = [];
      let needsUpdate = false;
      const updates: Partial<Event> = {};

      try {
        // Fix date field
        if (!isValidTimestamp(data.date)) {
          if (typeof data.date === 'string' && data.time) {
            const parsedDate = parseDateTime(data.date, data.time);
            if (parsedDate) {
              updates.date = admin.firestore.Timestamp.fromDate(parsedDate);
              changes.push('Converted date to Timestamp');
              needsUpdate = true;
            } else {
              throw new Error('Could not parse date/time format');
            }
          } else {
            throw new Error('Invalid date format and cannot be converted');
          }
        }

        // Fix missing imageUrl
        if (!data.imageUrl) {
          updates.imageUrl = FALLBACK_IMAGE_URL;
          changes.push('Added fallback imageUrl');
          needsUpdate = true;
        }

        if (needsUpdate) {
          await db.doc(`events/${doc.id}`).update(updates);
          console.log(`✅ Updated event ${doc.id}`);
          summary.updated++;
          summary.updatedDocs.push({ id: doc.id, changes });
        } else {
          console.log(`ℹ️  Skipping event ${doc.id} (already valid)`);
          summary.skipped++;
        }
      } catch (error: any) {
        console.error(`❌ Failed to update event ${doc.id}:`, error?.message || 'Unknown error');
        summary.failed++;
        summary.failedDocs.push({ id: doc.id, error: error?.message || 'Unknown error' });
      }
    }
  } catch (error: any) {
    console.error('❌ Failed to fetch events:', error?.message || 'Unknown error');
    throw error;
  }

  return summary;
}

// Print migration summary
function printSummary(summary: MigrationSummary) {
  console.log('\n📊 Migration Summary');
  console.log('==================');
  console.log(`Total documents: ${summary.total}`);
  console.log(`Updated: ${summary.updated}`);
  console.log(`Skipped: ${summary.skipped}`);
  console.log(`Failed: ${summary.failed}`);

  if (summary.updatedDocs.length > 0) {
    console.log('\n✅ Updated Documents:');
    summary.updatedDocs.forEach(({ id, changes }) => {
      console.log(`\n${id}:`);
      changes.forEach(change => console.log(`  - ${change}`));
    });
  }

  if (summary.failedDocs.length > 0) {
    console.log('\n❌ Failed Documents:');
    summary.failedDocs.forEach(({ id, error }) => {
      console.log(`\n${id}:`);
      console.log(`  - Error: ${error}`);
    });
  }

  // Print final status
  const success = summary.failed === 0;
  console.log('\n🏁 Final Status:', success ? '✅ PASSED' : '❌ FAILED');
}

// Run migration
migrateEvents()
  .then(summary => {
    printSummary(summary);
    process.exit(summary.failed === 0 ? 0 : 1);
  })
  .catch(error => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }); 