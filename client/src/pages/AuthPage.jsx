import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AICore3D from '../components/3d/AICore3D.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mail, Lock, User, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, Send } from 'lucide-react';

export default function AuthPage() {
  const [authMode, setAuthMode] = useState('google'); // 'google', 'magicLink', 'password'
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const {
    login,
    register,
    loginWithGoogle,
    loginWithFirebaseEmail,
    registerWithFirebaseEmail,
    sendEmailSignInLink,
    loginWithEmailLink,
  } = useAuth();
  const navigate = useNavigate();

  // Check if landing via Email Link
  React.useEffect(() => {
    if (typeof window !== 'undefined' && (window.location.search.includes('apiKey') || window.location.href.includes('emailLink=true'))) {
      setLoading(true);
      loginWithEmailLink(email)
        .then((res) => {
          if (res?.success) {
            setSuccessMsg('Email Link confirmed! Signing you in...');
            setTimeout(() => navigate('/chat'), 800);
          }
        })
        .catch((err) => {
          setError(err.message || 'Failed to complete Email Link sign-in');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, []);

  const handleMagicLink = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide your email address first.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await sendEmailSignInLink(email);
      setSuccessMsg(`Sign-in link sent to ${email}! Open the link in your email to sign in instantly.`);
    } catch (err) {
      setError(err.message || 'Failed to send sign-in link. Please check your email address.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await loginWithGoogle();
      if (res?.success) {
        setSuccessMsg('Signed in with Google successfully!');
        setTimeout(() => navigate('/chat'), 800);
      }
    } catch (err) {
      if (err.code === 'auth/configuration-not-found' || err.message?.includes('configuration-not-found')) {
        setError('Google Sign-In is not enabled yet in your Firebase project (zsyiogpt). Please go to Firebase Console -> Authentication -> Sign-in method -> Enable "Google".');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Google Sign-In was cancelled (popup window was closed).');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Google Sign-In popup was blocked by browser. Please allow popups for localhost.');
      } else {
        setError(err.message || 'Failed to sign in with Google');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (isLogin) {
        // Try Firebase email first, fallback to direct backend login
        try {
          const res = await loginWithFirebaseEmail(email, password);
          if (res.success) {
            setSuccessMsg('Welcome back!');
            setTimeout(() => navigate('/chat'), 800);
            return;
          }
        } catch {
          const res = await login(email, password);
          if (res.success) {
            setSuccessMsg('Welcome back!');
            setTimeout(() => navigate('/chat'), 800);
            return;
          }
        }
      } else {
        // Register flow
        try {
          const res = await registerWithFirebaseEmail(email, password, name);
          if (res.success) {
            setSuccessMsg('Account created with 1,000 Free Credits!');
            setTimeout(() => navigate('/chat'), 1000);
            return;
          }
        } catch {
          const res = await register(name, email, password);
          if (res.success) {
            setSuccessMsg('Account created with 1,000 Free Credits!');
            setTimeout(() => navigate('/chat'), 1000);
            return;
          }
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100dvh-65px)] flex items-center justify-center p-3 sm:p-6 lg:p-8 aurora-bg relative overflow-hidden">
      {/* Decorative background glow orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-cyan/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-purple/25 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 glass-panel rounded-2xl sm:rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative z-10">
        
        {/* Left Col: 3D Holographic AI Showcase */}
        <div className="hidden lg:flex flex-col justify-between p-8 bg-gradient-to-b from-dark-900/90 to-dark-950/90 border-r border-white/5 relative">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-brand-cyan/40 shadow-glow-cyan bg-dark-950 p-0.5 shrink-0">
                <img
                  src="/hero.jpeg"
                  alt="ZsyioGPT"
                  className="w-full h-full object-cover rounded-[10px]"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/logo.png';
                  }}
                />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-[10px] font-mono">
                  <Sparkles className="w-3 h-3" />
                  <span>ZSYIOGPT CORE</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono tracking-wider mt-0.5">INTELLIGENT AI SOLUTIONS</div>
              </div>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
              Next-Gen Unified AI Ecosystem
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Access OpenAI GPT-4o, Claude 3.7 Thinking, Gemini 2.0 Flash, and Grok with real-time SSE streaming, multimodal image generation, and PDF intelligence.
            </p>
          </div>

          {/* Interactive 3D Model */}
          <div className="my-4">
            <AICore3D className="h-64 w-full" />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/10 text-center">
            <div className="p-2 rounded-xl bg-white/5">
              <span className="text-xs font-bold text-brand-cyan block">1,000</span>
              <span className="text-[10px] text-slate-400">Free Credits</span>
            </div>
            <div className="p-2 rounded-xl bg-white/5">
              <span className="text-xs font-bold text-brand-purple block">4 Models</span>
              <span className="text-[10px] text-slate-400">Multi-Gateway</span>
            </div>
            <div className="p-2 rounded-xl bg-white/5">
              <span className="text-xs font-bold text-brand-emerald block">Instant</span>
              <span className="text-[10px] text-slate-400">Zero Setup</span>
            </div>
          </div>
        </div>

        {/* Right Col: Auth Form */}
        <div className="p-5 sm:p-8 lg:p-10 flex flex-col justify-center bg-dark-900/60 backdrop-blur-xl">
          <div className="mb-5 sm:mb-6">
            <div className="flex items-center gap-2.5 mb-3 sm:mb-4 lg:hidden">
              <img
                src="/hero.jpeg"
                alt="ZsyioGPT"
                className="w-9 h-9 rounded-xl object-cover border border-white/10"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/logo.png';
                }}
              />
              <div>
                <span className="font-bold text-white text-sm">ZsyioGPT</span>
                <span className="text-[9px] text-slate-400 block font-mono">INTELLIGENT AI SOLUTIONS</span>
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">
              Sign In with Google Account
            </h1>
            <p className="text-xs text-slate-400">
              Sign in securely with your verified Google Account. Strictly no demo or unverified accounts.
            </p>
          </div>

          {/* Error & Success Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 1-Click Google OAuth */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full flex items-center justify-between gap-3 py-3.5 px-4 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs mb-5 transition-all shadow-xl hover:shadow-2xl group touch-press disabled:opacity-50 border border-white/20"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span className="text-sm">Continue with Google Account</span>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-semibold border border-slate-200">
              Google Auth
            </span>
          </button>

          {/* Mode Switch: Password vs Passwordless Magic Link */}
          <div className="flex rounded-xl bg-dark-950 p-1 border border-white/10 mb-4">
            <button
              type="button"
              onClick={() => setAuthMode('password')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                authMode === 'password' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('magicLink')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ${
                authMode === 'magicLink' ? 'bg-white/10 text-brand-cyan' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Send className="w-3 h-3" />
              <span>Email Link (Passwordless)</span>
            </button>
          </div>

          {authMode === 'magicLink' ? (
            /* Magic Link Form */
            <form onSubmit={handleMagicLink} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-base sm:text-xs text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl btn-neon-primary flex items-center justify-center gap-2 text-xs mt-2 disabled:opacity-50 touch-press font-semibold"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loading ? 'Sending Link...' : 'Send Magic Sign-In Link'}</span>
              </button>
              <p className="text-[10px] text-slate-400 text-center">
                We'll email you a secure link to sign in instantly without needing a password.
              </p>
            </form>
          ) : (
            /* Standard Password Form */
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {!isLogin && (
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Mercer"
                      className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-base sm:text-xs text-white placeholder-slate-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-base sm:text-xs text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-base sm:text-xs text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl btn-neon-primary flex items-center justify-center gap-2 text-xs mt-2 disabled:opacity-50 touch-press font-semibold"
              >
                <span>{loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* Switch toggle */}
          <div className="mt-5 text-center text-xs text-slate-400">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccessMsg('');
              }}
              className="text-brand-cyan hover:underline font-medium"
            >
              {isLogin ? 'Register now' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
