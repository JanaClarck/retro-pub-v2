import * as admin from 'firebase-admin';

// Initialize Firebase Admin
const serviceAccount = require('../service-account-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Types for sections
interface BaseSection {
  updatedAt: admin.firestore.FieldValue;
  imageUrl: string;
}

interface HeroSection extends BaseSection {}

interface AboutSection extends BaseSection {
  heading: string;
  subheading: string;
  description: string;
}

interface InteriorSection extends BaseSection {
  heading: string;
  description: string;
  imagePosition: 'left' | 'right';
}

interface DescriptionSection extends BaseSection {
  content: string;
}

// Migration summary tracking
interface MigrationSummary {
  created: string[];
  skipped: string[];
  errors: { path: string; error: string }[];
}

// Default section data
const defaultSections: Record<string, any> = {
  'hero': {
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/retropub-7bfe5.appspot.com/o/hero.jpg?alt=media",
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  } as HeroSection,

  'about': {
    heading: "About Us",
    subheading: "Great food, great vibes",
    description: "We are a retro pub serving great food and events...",
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/retropub-7bfe5.appspot.com/o/about.jpg?alt=media",
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  } as AboutSection,

  'interior': {
    heading: "Our Interior",
    description: "Step into a vintage world of charm and coziness.",
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/retropub-7bfe5.appspot.com/o/interior.jpg?alt=media",
    imagePosition: "right",
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  } as InteriorSection,

  'menu.description': {
    content: "Explore our seasonal menu and crafted drinks.",
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/retropub-7bfe5.appspot.com/o/menu.jpg?alt=media",
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  } as DescriptionSection,

  'gallery.description': {
    content: "Snapshots from our best nights and ambient vibes.",
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/retropub-7bfe5.appspot.com/o/gallery.jpg?alt=media",
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  } as DescriptionSection
};

async function migrateSections(): Promise<MigrationSummary> {
  console.log('🚀 Starting sections migration...\n');

  const summary: MigrationSummary = {
    created: [],
    skipped: [],
    errors: []
  };

  for (const [sectionId, data] of Object.entries(defaultSections)) {
    const docPath = `sections/${sectionId}`;
    
    try {
      // Check if document exists
      const doc = await db.doc(docPath).get();
      
      if (doc.exists) {
        console.log(`ℹ️  Skipping ${docPath}: Document already exists`);
        summary.skipped.push(docPath);
        continue;
      }

      // Create document
      await db.doc(docPath).set(data);
      console.log(`✅ Created ${docPath}`);
      summary.created.push(docPath);
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error';
      console.error(`❌ Error creating ${docPath}:`, errorMessage);
      summary.errors.push({ path: docPath, error: errorMessage });
    }
  }

  return summary;
}

// Print summary report
function printSummary(summary: MigrationSummary) {
  console.log('\n📊 Migration Summary:');
  console.log('--------------------');
  console.log(`✅ Created: ${summary.created.length}`);
  if (summary.created.length > 0) {
    summary.created.forEach(path => console.log(`   - ${path}`));
  }

  console.log(`\nℹ️  Skipped: ${summary.skipped.length}`);
  if (summary.skipped.length > 0) {
    summary.skipped.forEach(path => console.log(`   - ${path}`));
  }

  console.log(`\n❌ Errors: ${summary.errors.length}`);
  if (summary.errors.length > 0) {
    summary.errors.forEach(({ path, error }) => console.log(`   - ${path}: ${error}`));
  }
}

// Run migration
migrateSections()
  .then((summary) => {
    printSummary(summary);
    console.log('\n✨ Migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }); 