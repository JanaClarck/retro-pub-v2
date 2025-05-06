import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';

// Read service account credentials from your local firebase-admin.json
const serviceAccount = JSON.parse(fs.readFileSync('./firebase-admin.json', 'utf8'));

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

// Load data from the seed file
const seedData = JSON.parse(fs.readFileSync('./firestore-seed-data.json', 'utf8'));

async function seedCollection(collectionName: string, items: any[]) {
  const batch = db.batch();
  items.forEach((item: any) => {
    const docRef = db.collection(collectionName).doc(item.id);
    batch.set(docRef, item);
  });
  await batch.commit();
  console.log(`✅ Seeded ${collectionName} with ${items.length} items.`);
}

async function main() {
  try {
    await seedCollection('menu', seedData.menu);
    await seedCollection('events', seedData.events);
    await seedCollection('gallery', seedData.gallery);
    console.log('🔥 All data has been seeded!');
  } catch (err) {
    console.error('❌ Error seeding data:', err);
  }
}

main();