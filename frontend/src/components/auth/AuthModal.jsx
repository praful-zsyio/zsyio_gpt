import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from '../../config/firebase';
import { apiClient } from '../../api/client';
import confetti from 'canvas-confetti';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Sync mode with initialMode whenever opened or requested
  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setSuccessMsg(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  // 1. Google Sign-In with Firebase
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();

      // Sync with backend /api/v1/auth/firebase
      try {
        const res = await apiClient.post('/auth/firebase', {
          idToken,
          email: user.email,
          displayName: user.displayName,
          name: user.displayName,
          photoURL: user.photoURL,
          avatar: user.photoURL,
          uid: user.uid,
        });

        if (res.data?.success && res.data?.data?.token) {
          localStorage.setItem('zsyiogpt_token', res.data.data.token);
          localStorage.setItem('zsyiogpt_user', JSON.stringify(res.data.data.user));
          onAuthSuccess(res.data.data.user);
        } else {
          // Fallback to Firebase profile
          const appUser = {
            _id: user.uid,
            name: user.displayName || 'Google User',
            email: user.email,
            photoURL: user.photoURL,
            role: 'user',
            credits: 250,
          };
          localStorage.setItem('zsyiogpt_user', JSON.stringify(appUser));
          onAuthSuccess(appUser);
        }
      } catch (apiErr) {
        console.warn('Backend Firebase sync note:', apiErr.message);
        const appUser = {
          _id: user.uid,
          name: user.displayName || 'Google User',
          email: user.email,
          photoURL: user.photoURL,
          role: 'user',
          credits: 250,
        };
        localStorage.setItem('zsyiogpt_user', JSON.stringify(appUser));
        onAuthSuccess(appUser);
      }

      confetti({ particleCount: 70, spread: 60, origin: { y: 0.5 } });
      onClose();
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      setError(err.message || 'Google sign-in could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Email & Password Auth (Backend + Firebase)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        // Backend register
        try {
          const res = await apiClient.post('/auth/register', {
            name: name || email.split('@')[0],
            email,
            password,
          });
          if (res.data?.success) {
            const { token, user } = res.data.data;
            localStorage.setItem('zsyiogpt_token', token);
            localStorage.setItem('zsyiogpt_user', JSON.stringify(user));
            onAuthSuccess(user);
            confetti({ particleCount: 60, spread: 50 });
            onClose();
            return;
          }
        } catch {
          // Firebase auth fallback
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const appUser = {
            _id: userCredential.user.uid,
            name: name || email.split('@')[0],
            email,
            role: 'user',
            credits: 200,
          };
          localStorage.setItem('zsyiogpt_user', JSON.stringify(appUser));
          onAuthSuccess(appUser);
          onClose();
          return;
        }
      } else {
        // Login
        try {
          const res = await apiClient.post('/auth/login', { email, password });
          if (res.data?.success) {
            const { token, user } = res.data.data;
            localStorage.setItem('zsyiogpt_token', token);
            localStorage.setItem('zsyiogpt_user', JSON.stringify(user));
            onAuthSuccess(user);
            onClose();
            return;
          }
        } catch {
          // Firebase fallback
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const appUser = {
            _id: userCredential.user.uid,
            name: userCredential.user.displayName || email.split('@')[0],
            email,
            role: 'user',
            credits: 200,
          };
          localStorage.setItem('zsyiogpt_user', JSON.stringify(appUser));
          onAuthSuccess(appUser);
          onClose();
          return;
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-md glass-panel-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 text-white overflow-hidden"
      >
        {/* Sky Blue Glow Accents */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-sky-400/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-600/25 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 via-blue-500 to-white text-blue-950 font-bold mb-3 shadow-lg shadow-sky-500/25">
            <Sparkles className="w-6 h-6 text-slate-900" />
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h3>
          <p className="text-xs text-sky-200 mt-1">
            Access unified AI models, long-form video studio & PDF generation
          </p>
        </div>

        {/* Google Sign-In with Firebase Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-white text-slate-900 font-semibold text-sm shadow-xl hover:bg-sky-50 transition-all hover:scale-[1.01] active:scale-[0.99] mb-4"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.92 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="flex items-center gap-3 my-4">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-[11px] font-mono text-sky-200 uppercase">or email</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-mono uppercase text-sky-200 mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-sky-300 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Mercer"
                  className="w-full bg-slate-900/60 border border-white/15 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-sky-400 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono uppercase text-sky-200 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-sky-300 absolute left-3.5 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                className="w-full bg-slate-900/60 border border-white/15 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-sky-400 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-sky-200 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-sky-300 absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-slate-900/60 border border-white/15 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-sky-400 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-400 via-blue-500 to-sky-600 text-white font-semibold text-sm shadow-xl shadow-sky-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In to Workspace' : 'Create Free Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Switch mode */}
        <div className="text-center mt-5 text-xs text-sky-200">
          {mode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-white font-bold underline hover:text-sky-300"
              >
                Sign Up
              </button>
            </span>
          ) : (
            <span>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-white font-bold underline hover:text-sky-300"
              >
                Log In
              </button>
            </span>
          )}
        </div>
      </motion.div>
    </div>
  );
}
