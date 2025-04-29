import { storage } from '../lib/firebase';
import { ref, uploadBytes } from 'firebase/storage';
import fs from 'fs';
import path from 'path';

const PUBLIC_IMAGES_DIR = path.join(process.cwd(), 'public', 'images');

interface ImageMapping {
  localPath: string;
  storagePath: string;
}

// Define the mapping of local images to Firebase Storage paths
const imageMapping: ImageMapping[] = [
  // Hero images
  { localPath: 'hero-bg.jpg', storagePath: 'hero/hero-bg.jpg' },
  
  // About section images
  { localPath: 'about-section.jpg', storagePath: 'about/about-section.jpg' },
  { localPath: 'about-interior.jpg', storagePath: 'about/about-interior.jpg' },
  
  // Event images
  { localPath: 'jazz-night.jpg', storagePath: 'events/live-jazz-night.jpg' },
  { localPath: 'comedy-night.jpg', storagePath: 'events/comedy-night.jpg' },
  { localPath: 'pub-quiz.jpg', storagePath: 'events/pub-quiz.jpg' },
  
  // Gallery images
  { localPath: 'gallery/interior-1.jpg', storagePath: 'interior/interior-1.jpg' },
  { localPath: 'gallery/interior-2.jpg', storagePath: 'interior/interior-2.jpg' },
  { localPath: 'gallery/interior-3.jpg', storagePath: 'interior/interior-3.jpg' },
  { localPath: 'gallery/interior-4.jpg', storagePath: 'interior/interior-4.jpg' },
  { localPath: 'gallery/jazz-night-1.jpg', storagePath: 'events/jazz-night-1.jpg' },
  { localPath: 'gallery/comedy-night-1.jpg', storagePath: 'events/comedy-night-1.jpg' },
  { localPath: 'gallery/quiz-night-1.jpg', storagePath: 'events/quiz-night-1.jpg' },
  { localPath: 'gallery/acoustic-1.jpg', storagePath: 'events/acoustic-1.jpg' },
  { localPath: 'gallery/trivia-1.jpg', storagePath: 'events/trivia-1.jpg' },
];

async function uploadImage(localPath: string, storagePath: string): Promise<void> {
  try {
    const fullPath = path.join(PUBLIC_IMAGES_DIR, localPath);
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      console.error(`File not found: ${fullPath}`);
      return;
    }

    // Read file
    const fileBuffer = fs.readFileSync(fullPath);
    
    // Create storage reference
    const storageRef = ref(storage, storagePath);
    
    // Upload file
    await uploadBytes(storageRef, fileBuffer, {
      contentType: `image/${path.extname(localPath).slice(1)}`,
    });
    
    console.log(`✅ Successfully uploaded: ${storagePath}`);
  } catch (error) {
    console.error(`❌ Error uploading ${localPath}:`, error);
  }
}

async function uploadAllImages() {
  console.log('Starting bulk upload...');
  
  for (const mapping of imageMapping) {
    await uploadImage(mapping.localPath, mapping.storagePath);
  }
  
  console.log('Bulk upload completed!');
}

// Run the upload
uploadAllImages().catch(console.error); 