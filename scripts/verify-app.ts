import * as admin from 'firebase-admin';
import * as fs from 'fs/promises';
import * as path from 'path';

// Initialize Firebase Admin
const serviceAccount = require('../service-account-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Types
interface VerificationSummary {
  routing: {
    total: number;
    found: string[];
    missing: string[];
  };
  firestore: {
    hero: {
      exists: boolean;
      issues: string[];
    };
    events: {
      total: number;
      valid: number;
      issues: Array<{ id: string; issues: string[] }>;
    };
  };
}

// Required routes to check
const requiredRoutes = [
  'app/public/page.tsx',
  'app/public/about/page.tsx',
  'app/public/menu/page.tsx',
  'app/public/events/page.tsx',
  'app/public/gallery/page.tsx',
];

// Validation functions
async function checkRoutes(): Promise<VerificationSummary['routing']> {
  console.log('\n🔍 Checking routing structure...');
  
  const summary = {
    total: requiredRoutes.length,
    found: [] as string[],
    missing: [] as string[]
  };

  for (const route of requiredRoutes) {
    try {
      await fs.access(route);
      console.log(`✅ Found: ${route}`);
      summary.found.push(route);
    } catch {
      console.log(`❌ Missing: ${route}`);
      summary.missing.push(route);
    }
  }

  return summary;
}

async function checkHeroSection(): Promise<VerificationSummary['firestore']['hero']> {
  console.log('\n🔍 Checking hero section...');
  
  const result = {
    exists: false,
    issues: [] as string[]
  };

  try {
    const heroDoc = await db.doc('sections/hero').get();
    
    if (!heroDoc.exists) {
      result.issues.push('Document does not exist');
      console.log('❌ Hero section missing in Firestore');
      return result;
    }

    result.exists = true;
    const data = heroDoc.data();

    if (!data?.imageUrl) {
      result.issues.push('Missing imageUrl field');
      console.log('❌ Hero imageUrl is missing');
    } else if (typeof data.imageUrl !== 'string' || data.imageUrl.trim() === '') {
      result.issues.push('Invalid or empty imageUrl');
      console.log('❌ Hero imageUrl is invalid or empty');
    } else {
      console.log('✅ Hero section and imageUrl found');
    }
  } catch (error: any) {
    result.issues.push(`Access error: ${error.message}`);
    console.error('❌ Error accessing hero section:', error.message);
  }

  return result;
}

async function checkEvents(): Promise<VerificationSummary['firestore']['events']> {
  console.log('\n🔍 Checking events collection...');
  
  const result = {
    total: 0,
    valid: 0,
    issues: [] as Array<{ id: string; issues: string[] }>
  };

  try {
    const eventsSnapshot = await db.collection('events').get();
    result.total = eventsSnapshot.size;

    if (eventsSnapshot.empty) {
      console.warn('⚠️ No events found');
      return result;
    }

    for (const doc of eventsSnapshot.docs) {
      const data = doc.data();
      const issues: string[] = [];

      // Check required fields
      if (!data.title) issues.push('missing title');
      if (!data.description) issues.push('missing description');
      if (!data.date) {
        issues.push('missing date');
      } else if (!(data.date instanceof admin.firestore.Timestamp)) {
        issues.push('invalid date format (not a Timestamp)');
      }
      if (!data.time) {
        issues.push('missing time');
      } else if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(data.time)) {
        issues.push('invalid time format (should be HH:MM)');
      }
      if (!data.imageUrl) {
        issues.push('missing imageUrl');
      } else if (typeof data.imageUrl !== 'string' || data.imageUrl.trim() === '') {
        issues.push('invalid or empty imageUrl');
      }
      if (typeof data.isActive !== 'boolean') {
        issues.push('missing or invalid isActive flag');
      }

      if (issues.length > 0) {
        console.log(`❌ Event ${doc.id} has issues: ${issues.join(', ')}`);
        result.issues.push({ id: doc.id, issues });
      } else {
        console.log(`✅ Event ${doc.id} is valid`);
        result.valid++;
      }
    }
  } catch (error: any) {
    console.error('❌ Error checking events:', error.message);
    result.issues.push({ id: '*', issues: [`Access error: ${error.message}`] });
  }

  return result;
}

// Main verification function
async function verifyApp(): Promise<VerificationSummary> {
  console.log('🚀 Starting app verification...');

  const summary: VerificationSummary = {
    routing: await checkRoutes(),
    firestore: {
      hero: await checkHeroSection(),
      events: await checkEvents()
    }
  };

  return summary;
}

// Print verification summary
function printSummary(summary: VerificationSummary) {
  console.log('\n📊 Verification Summary');
  console.log('=====================');

  // Routing summary
  console.log('\n📁 Routing Structure:');
  console.log(`Total routes checked: ${summary.routing.total}`);
  console.log(`Found: ${summary.routing.found.length}`);
  console.log(`Missing: ${summary.routing.missing.length}`);

  if (summary.routing.missing.length > 0) {
    console.log('\nMissing routes:');
    summary.routing.missing.forEach(route => console.log(`  - ${route}`));
  }

  // Hero section summary
  console.log('\n🎯 Hero Section:');
  console.log(`Exists: ${summary.firestore.hero.exists ? 'Yes' : 'No'}`);
  if (summary.firestore.hero.issues.length > 0) {
    console.log('Issues:');
    summary.firestore.hero.issues.forEach(issue => console.log(`  - ${issue}`));
  }

  // Events summary
  console.log('\n📅 Events:');
  console.log(`Total events: ${summary.firestore.events.total}`);
  console.log(`Valid events: ${summary.firestore.events.valid}`);
  
  if (summary.firestore.events.issues.length > 0) {
    console.log('\nEvents with issues:');
    summary.firestore.events.issues.forEach(({ id, issues }) => {
      console.log(`\n  ${id}:`);
      issues.forEach(issue => console.log(`    - ${issue}`));
    });
  }

  // Final status
  const isSuccess = 
    summary.routing.missing.length === 0 &&
    summary.firestore.hero.issues.length === 0 &&
    summary.firestore.events.issues.length === 0;

  console.log('\n🏁 Final Status:', isSuccess ? '✅ PASSED' : '❌ FAILED');
}

// Run verification
verifyApp()
  .then(summary => {
    printSummary(summary);
    process.exit(
      summary.routing.missing.length === 0 &&
      summary.firestore.hero.issues.length === 0 &&
      summary.firestore.events.issues.length === 0 ? 0 : 1
    );
  })
  .catch(error => {
    console.error('\n❌ Verification failed:', error);
    process.exit(1);
  }); 