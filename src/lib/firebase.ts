// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDq4HkG7ijr1hz9oQaFKvgCHXxcJ8s4_zk",
  authDomain: "house-finder-bad5c.firebaseapp.com",
  projectId: "house-finder-bad5c",
  storageBucket: "house-finder-bad5c.firebasestorage.app",
  messagingSenderId: "519681618441",
  appId: "1:519681618441:web:e09ecef4fefb6beb587ed8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Export the app instance
export default app;