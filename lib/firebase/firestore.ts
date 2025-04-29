import { getFirestore, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { app } from './firebase';

export interface FirestoreDocument {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export const db = getFirestore(app);

export async function getDocument<T>(collectionName: string, documentId: string): Promise<T | null> {
  try {
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting document:', error);
    return null;
  }
}

export async function getDocuments<T>(
  collectionName: string,
  whereClause?: { field: string; operator: string; value: any }
): Promise<T[]> {
  try {
    const collectionRef = collection(db, collectionName);
    let q = query(collectionRef);
    
    if (whereClause) {
      q = query(collectionRef, where(whereClause.field, whereClause.operator as any, whereClause.value));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as T);
  } catch (error) {
    console.error('Error getting documents:', error);
    return [];
  }
} 