import { storage } from '../firebase/client';
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll, StorageReference } from 'firebase/storage';

export interface StorageImage {
  id: string;
  name: string;
  url: string;
  ref: StorageReference;
  folder: string;
}

export const STORAGE_FOLDERS = {
  HERO: 'hero',
  ABOUT: 'about',
  EVENTS: 'events',
  GALLERY: 'gallery',
  INTERIOR: 'interior',
} as const;

export async function uploadImage(file: File, folder: string, customFileName?: string): Promise<StorageImage> {
  const fileName = customFileName || `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const storageRef = ref(storage, `${folder}/${fileName}`);

  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  return {
    id: storageRef.fullPath,
    name: fileName,
    url,
    ref: storageRef,
    folder,
  };
}

export async function deleteImage(imageRef: StorageReference): Promise<void> {
  await deleteObject(imageRef);
}

export async function listImages(folder: string): Promise<StorageImage[]> {
  const folderRef = ref(storage, folder);
  const result = await listAll(folderRef);
  
  const images = await Promise.all(
    result.items.map(async (item) => {
      const url = await getDownloadURL(item);
      return {
        id: item.fullPath,
        name: item.name,
        url,
        ref: item,
        folder,
      };
    })
  );

  return images;
}

export async function getImageUrl(path: string): Promise<string> {
  const imageRef = ref(storage, path);
  return await getDownloadURL(imageRef);
} 