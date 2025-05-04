// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCedDX51JOmjeUANdJPiKDU4Sof9wZGph0",
  authDomain: "retropub-7bfe5.firebaseapp.com",
  projectId: "retropub-7bfe5",
  storageBucket: "retropub-7bfe5",
  messagingSenderId: "14470383176",
  appId: "1:14470383176:web:a4588666865532f72a7a7d",
  measurementId: "G-TTEF4F9LLY"
};

// Initialize Firebase
const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
const auth = getAuth(firebaseApp);
const storage = getStorage(firebaseApp);

export { auth, storage };
export default firebaseApp;