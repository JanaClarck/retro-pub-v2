import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy } from 'firebase/firestore';
import { db, auth } from '@/firebase/client';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  isAvailable: boolean;
}

// Helper function to check authentication
function checkAuth() {
  if (!auth.currentUser) {
    throw new Error('Authentication required');
  }
}

export async function getMenuItems(): Promise<MenuItem[]> {
  checkAuth();
  const q = query(collection(db, 'menuItems'), orderBy('category'), orderBy('name'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as MenuItem));
}

export async function addMenuItem(data: Omit<MenuItem, 'id'>): Promise<string> {
  checkAuth();
  const docRef = await addDoc(collection(db, 'menuItems'), {
    ...data,
    createdAt: Date.now()
  });
  return docRef.id;
}

export async function updateMenuItem(id: string, data: Partial<MenuItem>): Promise<void> {
  checkAuth();
  await updateDoc(doc(db, 'menuItems', id), data);
}

export async function deleteMenuItem(id: string): Promise<void> {
  checkAuth();
  await deleteDoc(doc(db, 'menuItems', id));
} 