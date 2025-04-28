// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
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
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);