import { FirestoreDocument } from './firestore';
import { getDocument, getDocuments } from './firestore';

export interface MenuItem extends FirestoreDocument {
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  available: boolean;
  allergens?: string[];
  spicyLevel?: number;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
}

export async function getMenuItem(id: string): Promise<MenuItem | null> {
  return getDocument<MenuItem>('menu', id);
}

export async function getAllMenuItems(): Promise<MenuItem[]> {
  return getDocuments<MenuItem>('menu');
}

export async function getMenuItemsByCategory(category: string): Promise<MenuItem[]> {
  return getDocuments<MenuItem>('menu', {
    field: 'category',
    operator: '==',
    value: category
  });
}

export async function getAvailableMenuItems(): Promise<MenuItem[]> {
  return getDocuments<MenuItem>('menu', {
    field: 'available',
    operator: '==',
    value: true
  });
} 