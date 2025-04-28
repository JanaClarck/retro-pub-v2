"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import firebaseApp from "@/lib/firebase";
import { useAdminAuth } from "../useAdminAuth";

interface GalleryImage {
  id: string;
  url: string;
  title?: string;
  uploadDate: Date;
  storagePath: string;
}

export default function AdminGalleryPage() {
  const user = useAdminAuth();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const db = getFirestore(firebaseApp);
  const storage = getStorage(firebaseApp);

  // Subscribe to gallery updates
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "gallery"), orderBy("uploadDate", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newImages: GalleryImage[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        newImages.push({
          id: doc.id,
          url: data.url,
          title: data.title,
          uploadDate: data.uploadDate.toDate(),
          storagePath: data.storagePath,
        });
      });
      setImages(newImages);
    });

    return () => unsubscribe();
  }, [user, db]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    setError("");
    setSuccess("");

    try {
      // Create a storage reference
      const storagePath = `gallery/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, storagePath);

      // Upload the file
      const uploadTask = uploadBytesResumable(storageRef, file);

      // Monitor upload progress
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
        },
        (error) => {
          throw error;
        }
      );

      // Wait for upload to complete
      await uploadTask;

      // Get the download URL
      const url = await getDownloadURL(storageRef);

      // Save metadata to Firestore
      await addDoc(collection(db, "gallery"), {
        url,
        title: title.trim() || null,
        uploadDate: new Date(),
        storagePath,
      });

      setSuccess("Image uploaded successfully!");
      setTitle("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setError("Failed to upload image. Please try again.");
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (image: GalleryImage) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    setDeletingId(image.id);
    setError("");
    setSuccess("");

    try {
      // Delete from Storage
      const storageRef = ref(storage, image.storagePath);
      await deleteObject(storageRef);

      // Delete from Firestore
      await deleteDoc(doc(db, "gallery", image.id));

      setSuccess("Image deleted successfully!");
    } catch (err) {
      setError("Failed to delete image. Please try again.");
      console.error("Delete error:", err);
    } finally {
      setDeletingId(null);
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

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-2xl font-bold mb-6">Manage Gallery</h1>

          {/* Upload Form */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Upload New Image</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title (optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={uploading}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  placeholder="Enter image title"
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

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image) => (
              <div
                key={image.id}
                className="relative bg-white rounded-lg shadow overflow-hidden group"
              >
                <div className="aspect-square relative">
                  <Image
                    src={image.url}
                    alt={image.title || "Gallery image"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  {image.title && (
                    <h3 className="font-medium text-gray-900">{image.title}</h3>
                  )}
                  <div className="mt-2">
                    <button
                      onClick={() => handleDelete(image)}
                      disabled={deletingId === image.id}
                      className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
                    >
                      {deletingId === image.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 