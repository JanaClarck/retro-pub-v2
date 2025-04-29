import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
  StorageReference,
  UploadMetadata
} from 'firebase/storage';
import { storage } from './client';

export interface StorageFile {
  id: string;
  name: string;
  url: string;
  ref: StorageReference;
  folder: string;
  metadata?: UploadMetadata;
}

// Storage folders configuration
export const STORAGE_FOLDERS = {
  HERO: 'hero',
  ABOUT: 'about',
  EVENTS: 'events',
  GALLERY: 'gallery',
  MENU: 'menu',
  INTERIOR: 'interior',
} as const;

export type StorageFolder = keyof typeof STORAGE_FOLDERS;

// Upload a file to Firebase Storage
export async function uploadFile(
  file: File,
  folder: StorageFolder,
  customFileName?: string,
  metadata?: UploadMetadata
): Promise<StorageFile> {
  const fileName = customFileName || `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const storageRef = ref(storage, `${STORAGE_FOLDERS[folder]}/${fileName}`);

  await uploadBytes(storageRef, file, metadata);
  const url = await getDownloadURL(storageRef);

  return {
    id: storageRef.fullPath,
    name: fileName,
    url,
    ref: storageRef,
    folder: STORAGE_FOLDERS[folder],
    metadata
  };
}

// Delete a file from Firebase Storage
export async function deleteFile(fileRef: StorageReference): Promise<void> {
  await deleteObject(fileRef);
}

// List all files in a folder
export async function listFiles(folder: StorageFolder): Promise<StorageFile[]> {
  const folderRef = ref(storage, STORAGE_FOLDERS[folder]);
  const result = await listAll(folderRef);
  
  const files = await Promise.all(
    result.items.map(async (item) => {
      const url = await getDownloadURL(item);
      return {
        id: item.fullPath,
        name: item.name,
        url,
        ref: item,
        folder: STORAGE_FOLDERS[folder]
      };
    })
  );

  return files;
}

// Get download URL for a file
export async function getFileUrl(path: string): Promise<string> {
  const fileRef = ref(storage, path);
  return await getDownloadURL(fileRef);
}

// Generate a unique filename
export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  return `${timestamp}_${randomString}.${extension}`;
} 