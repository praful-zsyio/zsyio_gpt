import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDVgCxpsz8PV18qTM6NI9kpvpZeOSySR9Q",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "zsyiogpt.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "zsyiogpt",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "zsyiogpt.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "866726181668",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:866726181668:web:e81cdfef8b21ac365f51b1",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-VHJFB0D85Y"
};

// Initialize Firebase
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Initialize Analytics (supported in browser environments)
export let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch((err) => {
    console.debug('[Firebase Analytics] Not supported in this environment:', err.message);
  });
}

export const isFirebaseConfigured = () => {
  return !!firebaseConfig.apiKey && !firebaseConfig.apiKey.includes("Dummy");
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
