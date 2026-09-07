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
  isSignInWithEmailLink,
  signInWithEmailLink,
  sendSignInLinkToEmail,
  EmailAuthProvider,
  linkWithCredential,
  reauthenticateWithCredential,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  TotpMultiFactorGenerator,
  getMultiFactorResolver,
  RecaptchaVerifier,
} from 'firebase/auth';

export {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  isSignInWithEmailLink,
  signInWithEmailLink,
  sendSignInLinkToEmail,
  EmailAuthProvider,
  linkWithCredential,
  reauthenticateWithCredential,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  TotpMultiFactorGenerator,
  getMultiFactorResolver,
  RecaptchaVerifier,
};

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
 * Send passwordless Email Sign-In Link (Magic Link)
 */
export const sendMagicLink = async (email) => {
  const actionCodeSettings = {
    url: (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173') + '/auth?emailLink=true',
    handleCodeInApp: true,
  };
  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('emailForSignIn', email);
  }
  return { success: true };
};

/**
 * Check if the landing URL is an email sign-in link, and complete sign-in.
 */
export const checkAndCompleteEmailLinkSignIn = async (providedEmail = null) => {
  if (typeof window === 'undefined') return null;
  if (!isSignInWithEmailLink(auth, window.location.href)) {
    return null;
  }

  let email = providedEmail || window.localStorage.getItem('emailForSignIn');
  if (!email) {
    email = window.prompt('Please provide your email for sign-in confirmation:');
  }
  if (!email) {
    throw new Error('Email is required to complete email link sign-in.');
  }

  const result = await signInWithEmailLink(auth, email, window.location.href);
  window.localStorage.removeItem('emailForSignIn');

  return {
    success: true,
    user: {
      uid: result.user.uid,
      name: result.user.displayName || result.user.email?.split('@')[0] || 'User',
      email: result.user.email,
      avatar: result.user.photoURL || '',
    },
    isNewUser: result._tokenResponse?.isNewUser || false,
  };
};

/**
 * Link email link credential to the currently signed-in user
 */
export const linkEmailLinkCredential = async (email) => {
  if (!auth.currentUser) throw new Error('No user is currently signed in');
  const credential = EmailAuthProvider.credentialWithLink(email, window.location.href);
  const usercred = await linkWithCredential(auth.currentUser, credential);
  return usercred;
};

/**
 * Re-authenticate the current user with email link credential
 */
export const reauthenticateWithEmailLink = async (email) => {
  if (!auth.currentUser) throw new Error('No user is currently signed in');
  const credential = EmailAuthProvider.credentialWithLink(email, window.location.href);
  const usercred = await reauthenticateWithCredential(auth.currentUser, credential);
  return usercred;
};

/**
 * Login with Email and Password with optional Multi-Factor Authentication (MFA) resolution
 */
export const loginWithEmail = async (
  email,
  password,
  options = {}
) => {
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
    // Check if user is enrolled in MFA
    if (error.code === 'auth/multi-factor-auth-required') {
      const resolver = error.resolver || getMultiFactorResolver(auth, error);

      if (options.onMfaRequired) {
        return await options.onMfaRequired(resolver);
      }

      const selectedIndex = options.selectedIndex || 0;
      const hint = resolver.hints[selectedIndex] || resolver.hints[0];

      if (hint && hint.factorId === PhoneMultiFactorGenerator.FACTOR_ID) {
        const phoneInfoOptions = {
          multiFactorHint: hint,
          session: resolver.session,
        };
        const phoneAuthProvider = new PhoneAuthProvider(auth);
        const verificationId = await phoneAuthProvider.verifyPhoneNumber(
          phoneInfoOptions,
          options.recaptchaVerifier
        );
        const verificationCode = typeof options.getVerificationCode === 'function'
          ? await options.getVerificationCode(verificationId)
          : window.prompt('Please enter the SMS verification code:');

        const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
        const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
        const userCredential = await resolver.resolveSignIn(multiFactorAssertion);

        return {
          success: true,
          user: {
            uid: userCredential.user.uid,
            name: userCredential.user.displayName || userCredential.user.email?.split('@')[0] || 'User',
            email: userCredential.user.email,
            avatar: userCredential.user.photoURL || '',
          }
        };
      } else if (hint && hint.factorId === TotpMultiFactorGenerator.FACTOR_ID) {
        const verificationCode = typeof options.getVerificationCode === 'function'
          ? await options.getVerificationCode(null)
          : window.prompt('Please enter the Authenticator App (TOTP) code:');

        const multiFactorAssertion = TotpMultiFactorGenerator.assertionForSignIn(
          hint.uid,
          verificationCode
        );
        const userCredential = await resolver.resolveSignIn(multiFactorAssertion);

        return {
          success: true,
          user: {
            uid: userCredential.user.uid,
            name: userCredential.user.displayName || userCredential.user.email?.split('@')[0] || 'User',
            email: userCredential.user.email,
            avatar: userCredential.user.photoURL || '',
          }
        };
      } else {
        throw new Error(`Unsupported second factor: ${hint?.factorId}`);
      }
    }
    throw error;
  }
};

/**
 * Sign out of Firebase
 */
export const logoutFromFirebase = async () => {
  await signOut(auth);
};


