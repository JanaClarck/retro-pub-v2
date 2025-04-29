import { useState, useRef } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/firebase/client';
import { Button } from '@/components/ui';

interface ImageUploaderProps {
  categoryId: string;
  onUploadComplete: (imageUrl: string, fileName: string) => Promise<void>;
  disabled?: boolean;
}

export function ImageUploader({ categoryId, onUploadComplete, disabled }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Create a unique filename
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const storageRef = ref(storage, `gallery/${categoryId}/${fileName}`);
      
      // Start upload with progress tracking
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
        },
        (error) => {
          console.error('Upload error:', error);
          setError('Failed to upload image. Please try again.');
          setIsUploading(false);
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            await onUploadComplete(downloadUrl, fileName);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          } catch (err) {
            console.error('Error getting download URL:', err);
            setError('Failed to process uploaded image.');
          } finally {
            setIsUploading(false);
            setUploadProgress(0);
          }
        }
      );
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to start upload. Please try again.');
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={disabled || isUploading}
          ref={fileInputRef}
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className={`
            inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md
            ${
              disabled || isUploading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
            }
            text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          `}
        >
          {isUploading ? 'Uploading...' : 'Upload Image'}
        </label>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>

      {isUploading && (
        <div className="space-y-2">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600">
            Uploading: {uploadProgress}%
          </p>
        </div>
      )}
    </div>
  );
} 