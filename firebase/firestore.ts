import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  DocumentData,
  QueryConstraint,
  Timestamp
} from '@firebase/firestore';
import { db } from './client';

// Generic type for Firestore documents
export interface FirestoreDocument {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Generic CRUD operations
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
  constraints: QueryConstraint[] = []
): Promise<T[]> {
  const q = query(collection(db, collectionName), ...constraints);
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

// Query helper functions
export function whereEqual(field: string, value: any): QueryConstraint {
  return where(field, "==", value);
}

export function orderByDesc(field: string): QueryConstraint {
  return orderBy(field, "desc");
}

export function orderByAsc(field: string): QueryConstraint {
  return orderBy(field, "asc");
}

export function limitTo(n: number): QueryConstraint {
  return limit(n);
} 