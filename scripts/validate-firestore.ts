import * as admin from 'firebase-admin';
import { isValid } from 'date-fns';

// Initialize Firebase Admin
const serviceAccount = require('../service-account-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Types
interface ValidationError {
  collection: string;
  docId: string;
  errors: string[];
}

interface ValidationReport {
  success: boolean;
  errors: ValidationError[];
  accessErrors: string[];
  stats: {
    totalDocuments: number;
    validDocuments: number;
    invalidDocuments: number;
  };
}

interface Event {
  title: string;
  description: string;
  date: admin.firestore.Timestamp;
  time: string;
  imageUrl: string;
  isActive: boolean;
}

// Validation functions
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    // Check if it's a Firebase Storage path
    return url.startsWith('gs://') || url.startsWith('https://firebasestorage.googleapis.com/');
  }
}

function isValidTime(time: string): boolean {
  // Check HH:MM format
  return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
}

async function validateHeroSection(): Promise<ValidationError[]> {
  const errors: ValidationError[] = [];
  
  try {
    const heroDoc = await db.doc('sections/hero').get();
    
    if (!heroDoc.exists) {
      errors.push({
        collection: 'sections',
        docId: 'hero',
        errors: ['Document does not exist']
      });
      return errors;
    }

    const data = heroDoc.data();
    const docErrors: string[] = [];

    if (!data?.imageUrl) {
      docErrors.push('Missing imageUrl field');
    } else if (!isValidUrl(data.imageUrl)) {
      docErrors.push('Invalid imageUrl format');
    }

    if (docErrors.length > 0) {
      errors.push({
        collection: 'sections',
        docId: 'hero',
        errors: docErrors
      });
    }
  } catch (error: any) {
    errors.push({
      collection: 'sections',
      docId: 'hero',
      errors: [`Access error: ${error.message}`]
    });
  }

  return errors;
}

async function validateEvents(): Promise<ValidationError[]> {
  const errors: ValidationError[] = [];
  
  try {
    const eventsSnapshot = await db.collection('events').get();
    
    if (eventsSnapshot.empty) {
      errors.push({
        collection: 'events',
        docId: '*',
        errors: ['No events found in collection']
      });
      return errors;
    }

    let hasActiveEvent = false;

    eventsSnapshot.forEach(doc => {
      const data = doc.data() as Event;
      const docErrors: string[] = [];

      // Check required fields
      if (!data.title) docErrors.push('Missing title');
      if (!data.description) docErrors.push('Missing description');
      if (!data.date) {
        docErrors.push('Missing date');
      } else if (!(data.date instanceof admin.firestore.Timestamp)) {
        docErrors.push('Invalid date format (must be Firestore Timestamp)');
      }
      if (!data.time) {
        docErrors.push('Missing time');
      } else if (!isValidTime(data.time)) {
        docErrors.push('Invalid time format (must be HH:MM)');
      }
      if (!data.imageUrl) {
        docErrors.push('Missing imageUrl');
      } else if (!isValidUrl(data.imageUrl)) {
        docErrors.push('Invalid imageUrl format');
      }
      if (typeof data.isActive !== 'boolean') {
        docErrors.push('Missing or invalid isActive flag');
      }

      if (data.isActive) {
        hasActiveEvent = true;
      }

      if (docErrors.length > 0) {
        errors.push({
          collection: 'events',
          docId: doc.id,
          errors: docErrors
        });
      }
    });

    if (!hasActiveEvent) {
      errors.push({
        collection: 'events',
        docId: '*',
        errors: ['No active events found']
      });
    }
  } catch (error: any) {
    errors.push({
      collection: 'events',
      docId: '*',
      errors: [`Access error: ${error.message}`]
    });
  }

  return errors;
}

// Main validation function
async function validateFirestore(): Promise<ValidationReport> {
  console.log('🔍 Starting Firestore validation...\n');

  const report: ValidationReport = {
    success: true,
    errors: [],
    accessErrors: [],
    stats: {
      totalDocuments: 0,
      validDocuments: 0,
      invalidDocuments: 0
    }
  };

  try {
    // Validate hero section
    console.log('Checking hero section...');
    const heroErrors = await validateHeroSection();
    report.errors.push(...heroErrors);

    // Validate events
    console.log('Checking events collection...');
    const eventErrors = await validateEvents();
    report.errors.push(...eventErrors);

    // Update stats
    report.stats.totalDocuments = 1 + (await db.collection('events').count().get()).data().count;
    report.stats.invalidDocuments = report.errors.length;
    report.stats.validDocuments = report.stats.totalDocuments - report.stats.invalidDocuments;

    // Set success flag
    report.success = report.errors.length === 0;
  } catch (error: any) {
    report.accessErrors.push(`Failed to access Firestore: ${error.message}`);
    report.success = false;
  }

  return report;
}

// Print validation report
function printReport(report: ValidationReport) {
  console.log('\n📊 Validation Report');
  console.log('==================');
  
  // Print stats
  console.log('\n📈 Statistics:');
  console.log(`Total documents checked: ${report.stats.totalDocuments}`);
  console.log(`Valid documents: ${report.stats.validDocuments}`);
  console.log(`Invalid documents: ${report.stats.invalidDocuments}`);

  // Print validation errors
  if (report.errors.length > 0) {
    console.log('\n❌ Validation Errors:');
    report.errors.forEach(error => {
      console.log(`\n${error.collection}/${error.docId}:`);
      error.errors.forEach(err => console.log(`  - ${err}`));
    });
  }

  // Print access errors
  if (report.accessErrors.length > 0) {
    console.log('\n⚠️  Access Errors:');
    report.accessErrors.forEach(error => console.log(`  - ${error}`));
  }

  // Print final status
  console.log('\n🏁 Final Status:', report.success ? '✅ PASSED' : '❌ FAILED');
}

// Run validation
validateFirestore()
  .then(report => {
    printReport(report);
    process.exit(report.success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n❌ Validation script failed:', error);
    process.exit(1);
  }); 