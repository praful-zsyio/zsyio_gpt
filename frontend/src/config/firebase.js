import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDVgCxpsz8PV18qTM6NI9kpvpZeOSySR9Q",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "zsyiogpt.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "zsyiogpt",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "zsyiogpt.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "866726181668",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:866726181668:web:e81cdfef8b21ac365f51b1",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-VHJFB0D85Y",
};

// Initialize Firebase safely (avoid multi-init)
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
};
