"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  StorageReference,
} from "firebase/storage";
import firebaseApp from "@/lib/firebase";
import { useAdminAuth } from "../useAdminAuth";

interface StorageImage {
  name: string;
  url: string;
  ref: StorageReference;
  folder: string;
}

const FOLDERS = [
  { id: "hero", name: "Hero Images" },
  { id: "about", name: "About Section" },
  { id: "menu", name: "Menu Items" },
  { id: "events", name: "Events" },
  { id: "gallery", name: "Gallery" },
];

export default function AdminGalleryPage() {
  const user = useAdminAuth();
  const [images, setImages] = useState<StorageImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFolder, setSelectedFolder] = useState(FOLDERS[0].id);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteImage, setDeleteImage] = useState<StorageImage | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const storage = getStorage(firebaseApp);

  // Fetch images from all folders
  const fetchImages = async () => {
    setLoading(true);
    setError("");
    try {
      const allImages: StorageImage[] = [];
      
      // Fetch images from each folder
      for (const folder of FOLDERS) {
        const folderRef = ref(storage, folder.id);
        const result = await listAll(folderRef);
        
        // Get download URLs for all images in this folder
        const folderImages = await Promise.all(
          result.items.map(async (itemRef) => {
            const url = await getDownloadURL(itemRef);
            return {
              name: itemRef.name,
              url,
              ref: itemRef,
              folder: folder.id,
            };
          })
        );
        
        allImages.push(...folderImages);
      }
      
      setImages(allImages);
    } catch (err) {
      setError("Failed to load images. Please try again.");
      console.error("Error fetching images:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchImages();
    }
  }, [user]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    setError("");
    setSuccess("");

    try {
      // Create a storage reference in the selected folder
      const storagePath = `${selectedFolder}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, storagePath);

      // Upload the file
      const uploadTask = uploadBytesResumable(storageRef, file);

      // Return a promise that resolves when the upload is complete
      await new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(Math.round(progress));
          },
          (error) => {
            reject(error);
          },
          () => {
            resolve(uploadTask);
          }
        );
      });

      setSuccess("Image uploaded successfully!");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      // Refresh the image list
      await fetchImages();
    } catch (err) {
      setError("Failed to upload image. Please try again.");
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (image: StorageImage) => {
    setError("");
    setSuccess("");

    try {
      await deleteObject(image.ref);
      setSuccess("Image deleted successfully!");
      await fetchImages();
      setDeleteImage(null);
    } catch (err) {
      setError("Failed to delete image. Please try again.");
      console.error("Delete error:", err);
    }
  };

  if (user === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-lg font-semibold">Loading...</div>
      </div>
    );
  }

  if (user === null) {
    return null;
  }

  // Group images by folder
  const imagesByFolder = images.reduce((acc, image) => {
    if (!acc[image.folder]) {
      acc[image.folder] = [];
    }
    acc[image.folder].push(image);
    return acc;
  }, {} as Record<string, StorageImage[]>);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-2xl font-bold mb-6">Manage Gallery</h1>

          {/* Upload Section */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Upload New Image</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Folder
                </label>
                <select
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                  disabled={uploading}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                >
                  {FOLDERS.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Choose Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                  disabled={uploading}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                />
              </div>
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="mt-4">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Uploading: {uploadProgress}%
                </p>
              </div>
            )}

            {/* Messages */}
            {error && (
              <div className="mt-4 text-sm text-red-600 bg-red-50 rounded-md p-3">
                {error}
              </div>
            )}
            {success && (
              <div className="mt-4 text-sm text-green-600 bg-green-50 rounded-md p-3">
                {success}
              </div>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            </div>
          )}

          {/* Gallery Sections */}
          {!loading && FOLDERS.map((folder) => (
            <div key={folder.id} className="mb-8">
              <h2 className="text-xl font-semibold mb-4">{folder.name}</h2>
              {imagesByFolder[folder.id]?.length === 0 ? (
                <p className="text-gray-500 italic">No images in this folder</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {imagesByFolder[folder.id]?.map((image) => (
                    <div
                      key={image.ref.fullPath}
                      className="relative bg-white rounded-lg shadow overflow-hidden group"
                    >
                      <div className="aspect-square relative">
                        <Image
                          src={image.url}
                          alt={image.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-gray-600 truncate">{image.name}</p>
                        <button
                          onClick={() => setDeleteImage(image)}
                          className="mt-2 text-sm text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this image? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeleteImage(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteImage && handleDelete(deleteImage)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 