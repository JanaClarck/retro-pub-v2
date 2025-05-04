import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getStorage, type Storage } from 'firebase-admin/storage';

// Type definitions for environment variables
interface FirebaseAdminConfig {
  projectId: string;
  clientEmail: string;
  privateKey: string;
  storageBucket: string;
}

// Load and validate environment variables
function loadConfig(): FirebaseAdminConfig {
  const { KEY, PRIVATE, NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET } = process.env;

  if (!KEY || !PRIVATE || !NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) {
    throw new Error(
      'Missing required Firebase Admin environment variables: KEY, PRIVATE, NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET\n' +
      'Please check your .env file and ensure all variables are set.'
    );
  }

  return {
    ...JSON.parse(KEY),
    privateKey: PRIVATE.split(String.raw`\n`).join('\n'),
    storageBucket: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  } as FirebaseAdminConfig;
}

// Initialize Firebase Admin SDK (singleton pattern)
function initializeFirebaseAdmin(): App {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0];
  }

  const KEY = {
    "type": "service_account",
    "project_id": "retropub-7bfe5",
    "private_key_id": "d8077e9c4bcb3199a1e92e18f9e71568c221bf36",
    "client_email": "firebase-adminsdk-fbsvc@retropub-7bfe5.iam.gserviceaccount.com",
    "client_id": "117331189096893536827",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40retropub-7bfe5.iam.gserviceaccount.com"
  };

  const PRIVATE = "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDYhIBDSEnQceY/\n0jAcnskgWHRI7cCTySRx1odKgLGc75effr4+ZF/c5KUR8BZhPxCkZZ2MjFkn2V9w\nE1a7Lw91MM6jjHfclJn0y7Wx1D4ENiIxAT5ahuOPBPDKtZc55v7FgVEImTFSJFtf\nFBfD1qcY8uh0niSt2Q7wTCgfgT73w+ETIWxYrxvOw2t5A1B+ykeJVtbAeqdWIadm\naNhZV7p+BFGVLbuRvhJ7mx7hDF1XOkFX1lznyLZz/SHDLM2Er6HDlH/8X6nvZBDb\n6HtJqEIgLWvA4OYyjtlCs3gmOwSrocCyp9vBCpL2PZ/IbtaY19LEpAhyEUd9ut2D\n0xXHDRBZAgMBAAECggEAIZZoaUeQ/89zduoNwZrWO3jNTTTon2RgDXLImQOeyegW\n/syECZy7jEJB4yb56csFM2N6DcAF4psjZXjyhuYVgUn5fECBpYu92E4zmOsCVdfp\n9O0q9ZMgQOL00ZVa6MYPNqdJYUqWbpYqQHUW/K/TSxj/e3u+1+MooJlHzh9YG8oT\nc6eDrKLW27J9XmTHoo1l6+nJdsBJooucQjIumjbfrQpR5JmoZhZj9fe/Bv7U5D38\n6MsKmsDAR8hMCZWYAHM9fG+VquYxcBkVxDbbxOD5WvsJ27Ydmi6frzW5tNKOCDN1\nWohckEKzZJgGgO1m+y7DfFzrXhHi7KOtwu7SjlvoiwKBgQD6qBo/yq8UJ4u96t2H\nS9qje2gOjQsxeZx5RVfMP9myDmN/qJbv0tYdcFvq+tbtil6KXGXElsmh2TUpVskl\nPmLUMUhR5URU5uUs5YSVajMu3/ZmnBgUdmHKqOAGZ63i6NsAYg32GQrjwPIQF3d2\nWqw8XY7bXKXgebsrv+tNl5FrkwKBgQDdIhfFwCJ29reIEGdhi/L9k6MhLRVhEPpm\nxzKxnX2IN8cFWGLy4g0Vwd1wSgdb2u/0znFttAK+Umwdl9kSrLqrDozXcZjmaCge\n/b1nPtxsdGrSKLNh8ArqUdLq6bEhpB56xA/hCFIva80JyAJRvJJIbWST6NSlPJCT\nBEpaLci/4wKBgGsg8acWD2IDzNvsx6WNq/J3Se/+JCyPF2tVUcL//yD0uV3URj5V\n1CFc5kw1zSpVGzbzaqNs9txvoyL57po2YbLjJU+rN1s6G/TmW5Yof5unKP6N9FS6\ni+075BOYuF7kusUdI25tIZRZ4Js0DGDPPBHIwsfKfzLDlFWMfxr4jrR1AoGBAMBZ\n+pHCOnh+zVCm7DZW1QwsUzb1j2Y6rYWfeoIze1F1K0KECrY5WaZ2Vxdo3ZPSEu5A\ncTw63DQPYAox3tm2tD09T9fL8XNiYJvsncdkT7prXcvnKXpkoioG+M/sbW7U4spp\nJ2LYqRykydrbRuEwhZJIzbc3TVlaIGwxzDc7Iid/AoGAXanGr6JjPvSifsDoZfVm\n7Wbw6EF2kA+gd+kCWtyHpXae4dXgSAsPdiEF9jzo0bqHGxofZFnjCz26xX7VBNh1\neQ9ufbO8sdGEtmm2UVyN8sDeRS3Y6s1rY2hcYO5SJ3ZvPcL77NOLYZGzBEo5RVzS\nDZcFlIOSIKm/svj/E9BeKwI=\n-----END PRIVATE KEY-----\n";

  return initializeApp({
    credential: cert({
      ...KEY,
      privateKey: PRIVATE,
    }),
    storageBucket: "retropub-7bfe5.appspot.com",
  });
}

// Initialize all services
const adminApp = initializeFirebaseAdmin();
const adminAuth = getAuth(adminApp);
const db = getFirestore(adminApp);
const storage = getStorage(adminApp);

// Export configuration for use in other parts of the application
export const config = {
  projectId: "retropub-7bfe5",
  storageBucket: "retropub-7bfe5.appspot.com",
} as const;

// Export initialized service instances
export {
  adminApp,  // Firebase Admin app instance
  adminAuth, // Firebase Admin Auth instance
  db,        // Firestore instance
  storage,   // Storage instance
};

// Export types for use in other files
export type {
  App,       // Firebase Admin App type
  Auth,      // Firebase Admin Auth type
  Firestore, // Firestore type
  Storage,   // Storage type
}; 