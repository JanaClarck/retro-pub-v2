import * as admin from 'firebase-admin';
import * as path from 'path';

// Initialize Firebase Admin
const serviceAccount = require('../service-account-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Types
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

// Default content
const defaultSections = {
  'sections/hero': {
    imageUrl: 'https://firebasestorage.googleapis.com/hero.jpg',
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  } as HeroSection,

  'sections/about': {
    heading: 'About Us',
    subheading: 'Great food, great vibes',
    description: 'We are a retro pub serving delicious food and live events...',
    imageUrl: 'https://firebasestorage.googleapis.com/about.jpg',
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  } as AboutSection,

  'sections/interior': {
    heading: 'Our Interior',
    description: 'Step into a vintage world of charm...',
    imageUrl: 'https://firebasestorage.googleapis.com/interior.jpg',
    imagePosition: 'right',
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  } as InteriorSection,

  'sections/menu.description': {
    content: 'Check out our freshly made dishes and signature drinks.',
    imageUrl: 'https://firebasestorage.googleapis.com/menu.jpg',
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  } as DescriptionSection,

  'sections/gallery.description': {
    content: 'A look into our best moments and ambience.',
    imageUrl: 'https://firebasestorage.googleapis.com/gallery.jpg',
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  } as DescriptionSection
};

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

function validateSection(path: string, data: any): string[] {
  const errors: string[] = [];

  // Common validations
  if (!data.imageUrl) {
    errors.push('Missing imageUrl');
  } else if (!isValidUrl(data.imageUrl)) {
    errors.push('Invalid imageUrl format');
  }

  // Section-specific validations
  if (path.includes('about')) {
    if (!data.heading) errors.push('Missing heading');
    if (!data.subheading) errors.push('Missing subheading');
    if (!data.description) errors.push('Missing description');
  }

  if (path.includes('interior')) {
    if (!data.heading) errors.push('Missing heading');
    if (!data.description) errors.push('Missing description');
    if (!['left', 'right'].includes(data.imagePosition)) {
      errors.push('Invalid imagePosition (must be "left" or "right")');
    }
  }

  if (path.includes('.description')) {
    if (!data.content) errors.push('Missing content');
  }

  return errors;
}

// Create sections
async function createSections() {
  console.log('🚀 Creating default section documents...\n');

  for (const [path, data] of Object.entries(defaultSections)) {
    try {
      // Check if document exists
      const doc = await db.doc(path).get();
      
      if (doc.exists) {
        console.log(`ℹ️  Skipping ${path}: Document already exists`);
        continue;
      }

      // Validate data
      const errors = validateSection(path, data);
      if (errors.length > 0) {
        console.error(`❌ Validation failed for ${path}:`);
        errors.forEach(error => console.error(`   - ${error}`));
        continue;
      }

      // Create document
      await db.doc(path).set(data);
      console.log(`✅ Created ${path}`);
    } catch (error: any) {
      console.error(`❌ Error creating ${path}:`, error?.message || 'Unknown error');
    }
  }
}

// Run the script
createSections()
  .then(() => {
    console.log('\n✨ Section creation completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Section creation failed:', error);
    process.exit(1);
  }); 