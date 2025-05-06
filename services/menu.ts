import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db, auth } from '@/firebase-config/client';
import { COLLECTIONS } from '@/constants/collections';
import { MenuItemSchema } from '@/lib/validation/schemas';
import type { MenuItem } from '@/types';

// Helper function to check authentication
function checkAuth() {
  if (!auth.currentUser) {
    throw new Error('Authentication required');
  }
}

export async function getMenuItems(): Promise<MenuItem[]> {
  checkAuth();
  const q = query(collection(db, COLLECTIONS.MENU), orderBy('category'), orderBy('name'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data()
  } as MenuItem));
}

export async function addMenuItem(data: Omit<MenuItem, 'id' | 'createdAt'>): Promise<string> {
  checkAuth();
  const validatedData = MenuItemSchema.parse(data);
  const docRef = await addDoc(collection(db, COLLECTIONS.MENU), {
    ...validatedData,
    createdAt: new Date().toISOString()
  });
  return docRef.id;
}

export async function updateMenuItem(id: string, data: Partial<Omit<MenuItem, 'id' | 'createdAt'>>): Promise<void> {
  checkAuth();
  const validatedData = MenuItemSchema.partial().parse(data);
  await updateDoc(doc(db, COLLECTIONS.MENU, id), validatedData);
}

export async function deleteMenuItem(id: string): Promise<void> {
  checkAuth();
  await deleteDoc(doc(db, COLLECTIONS.MENU, id));
}

export async function createMenuItem(data: Omit<MenuItem, 'id' | 'createdAt'>) {
  const validatedData = MenuItemSchema.parse(data);
  
  const docRef = await addDoc(collection(db, COLLECTIONS.MENU), {
    ...validatedData,
    createdAt: new Date().toISOString(),
  });

  return docRef.id;
} 