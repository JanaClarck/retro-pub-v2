// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCS94XfIMgUT7lKw4t0pUhj3yL6_WRYFuc",
  authDomain: "retropub-prod.firebaseapp.com",
  projectId: "retropub-prod",
  storageBucket: "retropub-prod.firebasestorage.app",
  messagingSenderId: "855868247784",
  appId: "1:855868247784:web:3f40a5ed5ebeaea8c1435d",
  measurementId: "G-NBT4313MGD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);