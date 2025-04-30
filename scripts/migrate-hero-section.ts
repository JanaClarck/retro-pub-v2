import { db } from '@/firebase-config/client';
import { createDocument } from '@/firebase-config/firestore';

async function migrateHeroSection() {
  try {
    await createDocument('sections', 'hero', {
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/your-project.appspot.com/o/hero%2Fhero-bg.jpg',
      title: 'Welcome to Retro Pub',
      subtitle: 'Where classic meets contemporary',
      ctaText: 'Book a Table',
      ctaLink: '/public/booking'
    });

    console.log('✅ Hero section migrated successfully');
  } catch (error) {
    console.error('❌ Error migrating hero section:', error);
  }
}

// Run the migration
migrateHeroSection(); 