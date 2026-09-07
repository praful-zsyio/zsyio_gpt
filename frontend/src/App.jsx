import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Background3D from './components/3d/Background3D';
import Navbar from './components/layout/Navbar';
import LandingPage from './components/landing/LandingPage';
import ChatCockpit from './components/chat/ChatCockpit';
import MediaStudio from './components/media/MediaStudio';
import ProfilePage from './components/profile/ProfilePage';
import AuthModal from './components/auth/AuthModal';
import PaymentModal from './components/payment/PaymentModal';
import { useSmoothScroll } from './hooks/useSmoothScroll';
import { checkBackendHealth, fetchAIModels } from './api';
import { initializeAuth, apiClient } from './api/client';
import { auth, onAuthStateChanged } from './config/firebase';

export default function App() {
  // Initialize Lenis / Locomotive smooth scrolling
  useSmoothScroll();

  // Retrieve initial logged-in user if token and user exist and not guest
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('zsyiogpt_user');
      const token = localStorage.getItem('zsyiogpt_token');
      if (stored && token) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.role !== 'guest') return parsed;
      }
    } catch {
      // ignore
    }
    return null;
  });

  // If user is logged in -> start at 'chat', otherwise start at 'home'
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const stored = localStorage.getItem('zsyiogpt_user');
      const token = localStorage.getItem('zsyiogpt_token');
      if (stored && token) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.role !== 'guest') return 'chat';
      }
    } catch {
      // ignore
    }
    return 'home';
  });

  const [backendOnline, setBackendOnline] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('zsyiogpt_theme') || 'dark');
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'signup'
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Sync theme with documentElement, body class, data-theme & localStorage
  useEffect(() => {
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(theme);
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
    document.body.className = theme;
    localStorage.setItem('zsyiogpt_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleOpenAuth = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  // Route protection: If user is not authenticated, they can only view 'home'
  useEffect(() => {
    const isAuthed = Boolean(user && user.role !== 'guest');
    if (!isAuthed && activeTab !== 'home') {
      setActiveTab('home');
    }
  }, [user, activeTab]);

  useEffect(() => {
    // 1. Check Backend Health
    const pingBackend = async () => {
      const health = await checkBackendHealth();
      setBackendOnline(health.ok);
    };
    pingBackend();
    const interval = setInterval(pingBackend, 8000);

    // 2. Initialize Local / Auth session
    initializeAuth().then((userData) => {
      if (userData && userData.role !== 'guest') {
        setUser(userData);
      } else {
        setUser(null);
        setActiveTab('home');
      }
    });

    // 3. Listen to Firebase Auth state
    const unsubscribeFirebase = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const authedUser = {
          _id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          role: 'user',
          credits: 250,
        };
        setUser(authedUser);
        localStorage.setItem('zsyiogpt_user', JSON.stringify(authedUser));
        setActiveTab('chat');

        // Sync with backend to ensure user record & welcome email with Google shared data
        apiClient
          .post('/auth/firebase', {
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            name: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            avatar: firebaseUser.photoURL,
            uid: firebaseUser.uid,
          })
          .then((res) => {
            if (res.data?.success && res.data?.data?.token) {
              localStorage.setItem('zsyiogpt_token', res.data.data.token);
              if (res.data.data.user) {
                const fullUser = { ...authedUser, ...res.data.data.user };
                setUser(fullUser);
                localStorage.setItem('zsyiogpt_user', JSON.stringify(fullUser));
              }
            }
          })
          .catch((err) => console.warn('[Firebase Sync Notice]', err.message));
      }
    });

    // 4. Load Available AI Models
    fetchAIModels().then((loadedModels) => {
      if (loadedModels && loadedModels.length > 0) {
        setModels(loadedModels);
        const defaultModel = loadedModels.find((m) => m.id === 'gpt-4o') || loadedModels[0];
        setSelectedModel(defaultModel.id);
      }
    });

    return () => {
      clearInterval(interval);
      unsubscribeFirebase();
    };
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col selection:bg-sky-400/40 selection:text-white">
      {/* 3D Interactive Background Element in Sky Blue & White */}
      <Background3D theme={theme} />

      {/* Floating Glassmorphic Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        backendOnline={backendOnline}
        user={user}
        onOpenAuth={handleOpenAuth}
        onOpenPayment={() => setIsPaymentModalOpen(true)}
        onLogout={() => {
          setUser(null);
          setActiveTab('home');
        }}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Authentication Modal with Google Firebase */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(authedUser) => {
          setUser(authedUser);
          setActiveTab('chat');
          setIsAuthModalOpen(false);
        }}
      />

      {/* Payment & Credits Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        user={user}
        onPaymentSuccess={(updatedUser) => setUser(updatedUser)}
      />

      {/* Main View Area with Framer Motion transitions */}
      <main className="flex-1 flex flex-col relative z-10">
        <AnimatePresence mode="wait">
          {/* Unauthenticated: Home / Landing Page */}
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="flex-1"
            >
              <LandingPage onOpenAuth={handleOpenAuth} theme={theme} />
            </motion.div>
          )}

          {/* Authenticated: AI Chat Cockpit */}
          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="flex-1 flex flex-col"
            >
              <ChatCockpit
                models={models}
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                theme={theme}
              />
            </motion.div>
          )}

          {/* Authenticated: Media & Video Studio */}
          {activeTab === 'media' && (
            <motion.div
              key="media"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="flex-1"
            >
              <MediaStudio theme={theme} />
            </motion.div>
          )}

          {/* Authenticated: User Profile & Workspace Settings */}
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="flex-1"
            >
              <ProfilePage
                user={user}
                onUpdateUser={(updated) => setUser(updated)}
                theme={theme}
                setTheme={setTheme}
                toggleTheme={toggleTheme}
                onOpenPayment={() => setIsPaymentModalOpen(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
