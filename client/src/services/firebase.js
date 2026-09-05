import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';

// Firebase configuration from environment or fallback default project config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForLocalDevAndDemo123456",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "zsyiogpt-ai.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "zsyiogpt-ai",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "zsyiogpt-ai.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef1234567890"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const isFirebaseConfigured = () => {
  return !!import.meta.env.VITE_FIREBASE_API_KEY && !import.meta.env.VITE_FIREBASE_API_KEY.includes("Dummy");
};

/**
 * Sign in using Google OAuth popup
 */
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return {
      success: true,
      user: {
        uid: result.user.uid,
        name: result.user.displayName || result.user.email?.split('@')[0] || 'User',
        email: result.user.email,
        avatar: result.user.photoURL || '',
      }
    };
  } catch (error) {
    // If real Firebase popup fails or is in unconfigured demo mode, provide graceful simulated sign-in for seamless UI testing
    if (error.code === 'auth/api-key-not-valid' || error.code === 'auth/configuration-not-found' || error.code === 'auth/invalid-api-key') {
      console.warn('[Firebase Demo Mode] Real Firebase credentials not provided. Emulating Google OAuth login...');
      return {
        success: true,
        user: {
          uid: 'demo_google_' + Date.now(),
          name: 'Demo Google User',
          email: 'google.user@example.com',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        }
      };
    }
    throw error;
  }
};

/**
 * Register with Email and Password
 */
export const registerWithEmail = async (email, password, name) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (name && result.user) {
      await updateProfile(result.user, { displayName: name });
    }
    return {
      success: true,
      user: {
        uid: result.user.uid,
        name: name || result.user.email?.split('@')[0] || 'User',
        email: result.user.email,
        avatar: '',
      }
    };
  } catch (error) {
    if (error.code === 'auth/api-key-not-valid' || error.code === 'auth/configuration-not-found' || error.code === 'auth/invalid-api-key') {
      console.warn('[Firebase Demo Mode] Emulating Email Registration...');
      return {
        success: true,
        user: {
          uid: 'demo_user_' + Date.now(),
          name: name || email.split('@')[0],
          email,
          avatar: '',
        }
      };
    }
    throw error;
  }
};

/**
 * Login with Email and Password
 */
export const loginWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return {
      success: true,
      user: {
        uid: result.user.uid,
        name: result.user.displayName || result.user.email?.split('@')[0] || 'User',
        email: result.user.email,
        avatar: result.user.photoURL || '',
      }
    };
  } catch (error) {
    if (error.code === 'auth/api-key-not-valid' || error.code === 'auth/configuration-not-found' || error.code === 'auth/invalid-api-key') {
      console.warn('[Firebase Demo Mode] Emulating Email Login...');
      return {
        success: true,
        user: {
          uid: 'demo_user_' + Date.now(),
          name: email.split('@')[0],
          email,
          avatar: '',
        }
      };
    }
    throw error;
  }
};

/**
 * Sign out of Firebase
 */
export const logoutFromFirebase = async () => {
  try {
    await signOut(auth);
  } catch (e) {
    console.warn('[Firebase Logout]', e);
  }
};
