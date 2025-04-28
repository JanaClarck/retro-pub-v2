// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCedDX51JOmjeUANdJPiKDU4Sof9wZGph0",
  authDomain: "retropub-7bfe5.firebaseapp.com",
  projectId: "retropub-7bfe5",
  storageBucket: "retropub-7bfe5.appspot.com",
  messagingSenderId: "14470383176",
  appId: "1:14470383176:web:a4588666865532f72a7a7d",
  measurementId: "G-TTEF4F9LLY"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };