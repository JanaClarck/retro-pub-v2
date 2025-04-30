import type {
  DocumentData,
  QueryConstraint,
  DocumentReference,
  CollectionReference
} from 'firebase/firestore';
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from './client';

// Generic type for Firestore documents
export interface FirestoreDocument extends DocumentData {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Generic CRUD operations with proper date handling
export async function getDocument<T extends FirestoreDocument>(
  collectionName: string,
  docId: string
): Promise<T | null> {
  const docRef = doc(db, collectionName, docId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return null;
  
  const data = docSnap.data();
  return {
    ...data,
    id: docSnap.id,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate()
  } as T;
}

export async function getDocuments<T extends FirestoreDocument>(
  collectionName: string,
  queryConstraints: QueryConstraint[] = []
): Promise<T[]> {
  const q = query(collection(db, collectionName), ...queryConstraints);
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
    createdAt: doc.data().createdAt.toDate(),
    updatedAt: doc.data().updatedAt.toDate()
  })) as T[];
}

export async function createDocument<T extends FirestoreDocument>(
  collectionName: string,
  docId: string,
  data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
): Promise<T> {
  const timestamp = Timestamp.now();
  const docRef = doc(db, collectionName, docId);
  
  const documentData = {
    ...data,
    createdAt: timestamp,
    updatedAt: timestamp
  };
  
  await setDoc(docRef, documentData);
  
  return {
    ...data,
    id: docId,
    createdAt: timestamp.toDate(),
    updatedAt: timestamp.toDate()
  } as T;
}

export async function updateDocument<T extends FirestoreDocument>(
  collectionName: string,
  docId: string,
  data: Partial<T>
): Promise<void> {
  const docRef = doc(db, collectionName, docId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now()
  });
}

export async function deleteDocument(
  collectionName: string,
  docId: string
): Promise<void> {
  const docRef = doc(db, collectionName, docId);
  await deleteDoc(docRef);
}

// Export types
export type {
  DocumentData,
  QueryConstraint,
  DocumentReference,
  CollectionReference
};

// Export Timestamp for date handling
export { Timestamp }; 