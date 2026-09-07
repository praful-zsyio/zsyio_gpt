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

import {
  getAI,
  getGenerativeModel,
  GoogleAIBackend,
  AgentPlatformBackend,
  VertexAIBackend,
} from 'firebase/ai';

export {
  getAI,
  getGenerativeModel,
  GoogleAIBackend,
  AgentPlatformBackend,
  VertexAIBackend,
};

/**
 * Initialize the Firebase GenAI backend service.
 * Supports GoogleAIBackend (Gemini Developer API) and AgentPlatformBackend (Vertex AI).
 */
export const getFirebaseAI = (backendType = 'GoogleAI') => {
  const BackendClass = backendType === 'AgentPlatform'
    ? (AgentPlatformBackend || VertexAIBackend)
    : GoogleAIBackend;
  return getAI(app, { backend: new BackendClass() });
};

/**
 * Create a GenerativeModel instance with gemini-3.7-flash or another model.
 */
export const getFirebaseGenerativeModel = (modelName = 'gemini-3.7-flash', backendType = 'GoogleAI') => {
  const ai = getFirebaseAI(backendType);
  return getGenerativeModel(ai, { model: modelName });
};

/**
 * Generate text content using Firebase GenAI (matches user sample).
 */
export const runFirebaseGenAI = async (
  prompt = 'Write a story about a magic backpack.',
  modelName = 'gemini-3.7-flash',
  backendType = 'GoogleAI'
) => {
  const model = getFirebaseGenerativeModel(modelName, backendType);
  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text();
};

/**
 * Sign in using REAL Google OAuth popup only (NO demo user).
 */
export const signInWithGoogle = async () => {
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
};

/**
 * Register with Email and Password
 */
export const registerWithEmail = async (email, password, name) => {
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
};

/**
 * Login with Email and Password
 */
export const loginWithEmail = async (email, password) => {
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
};

/**
 * Sign out of Firebase
 */
export const logoutFromFirebase = async () => {
  await signOut(auth);
};

