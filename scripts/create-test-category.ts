import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase-config/client';

async function createTestCategory() {
  try {
    const docRef = await addDoc(collection(db, 'galleryCategories'), {
      name: 'Test Category',
      slug: 'test-category',
      createdAt: new Date()
    });
    console.log('Test category created with ID:', docRef.id);
  } catch (error) {
    console.error('Error creating test category:', error);
  }
}

createTestCategory(); 