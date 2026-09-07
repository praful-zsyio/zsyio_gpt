import React from 'react';
import { Sparkles, Bot, Wand2, User, Sun, Moon, LogIn, LogOut, Zap, CreditCard } from 'lucide-react';
import BrandLogo from '../common/BrandLogo';
import { auth, signOut } from '../../config/firebase';

export default function Navbar({
  activeTab,
  setActiveTab,
  backendOnline,
  user,
  onOpenAuth,
  onLogout,
  theme,
  toggleTheme,
  onOpenPayment,
}) {
  const isAuth = Boolean(user && user.role !== 'guest');

  const handleLogoutClick = async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    localStorage.removeItem('zsyiogpt_token');
    localStorage.removeItem('zsyiogpt_user');
    onLogout();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full glass-panel rounded-none border-t-0 border-x-0 border-b border-white/15 px-3 sm:px-8 lg:px-12 py-3 backdrop-blur-2xl shadow-xl transition-all">
      <div className="w-full flex items-center justify-between gap-3 sm:gap-6">
        {/* Brand & Logo */}
        <div
          onClick={() => setActiveTab(isAuth ? 'chat' : 'home')}
          className="flex items-center gap-2 cursor-pointer select-none group"
          title={isAuth ? 'Go to AI Chat' : 'Go to Home'}
        >
          <BrandLogo size="md" withText />
        </div>

        {/* Navigation Switcher */}
        <nav className="flex items-center gap-1 p-1 rounded-full bg-slate-500/10 border border-white/10">
          {!isAuth ? (
            <>
              <button
                onClick={() => setActiveTab('home')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'home'
                    ? 'bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-md shadow-sky-500/25'
                    : 'text-adaptive-muted hover:text-adaptive hover:bg-white/10'
                }`}
              >
                <span>Home</span>
              </button>

              <button
                onClick={() => onOpenAuth('signup')}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-adaptive-muted hover:text-adaptive hover:bg-white/10 transition-all"
                title="Sign up to access AI Chat"
              >
                <Bot className="w-3.5 h-3.5 text-sky-400" />
                <span>AI Chat</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'chat'
                    ? 'bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-md shadow-sky-500/25'
                    : 'text-adaptive-muted hover:text-adaptive hover:bg-white/10'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>AI Chat</span>
              </button>

              <button
                onClick={() => setActiveTab('media')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'media'
                    ? 'bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-md shadow-sky-500/25'
                    : 'text-adaptive-muted hover:text-adaptive hover:bg-white/10'
                }`}
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Studio</span>
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'profile'
                    ? 'bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-md shadow-sky-500/25'
                    : 'text-adaptive-muted hover:text-adaptive hover:bg-white/10'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>My Profile</span>
              </button>
            </>
          )}
        </nav>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Buy Credits - only when logged in */}
          {isAuth && (
            <button
              onClick={onOpenPayment}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-400 text-xs font-bold hover:bg-amber-400/25 transition-all shadow-sm"
              title="Buy AI Credits & Subscriptions"
            >
              <Zap className="w-3.5 h-3.5 fill-amber-400" />
              <span>{user?.credits?.toLocaleString() || '250'} cr</span>
              <span className="text-[10px] text-amber-300 underline ml-0.5">+Top Up</span>
            </button>
          )}

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full glass-panel text-adaptive-muted hover:text-sky-400 border border-white/10 transition-all shadow-sm"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-sky-600" />
            )}
          </button>

          {/* Backend Connection Indicator */}
          <div
            title={backendOnline ? 'Backend Connected (Port 5001)' : 'Connecting to Backend...'}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full glass-panel border border-white/10 text-xs text-adaptive select-none cursor-default"
          >
            <span className="relative flex h-2 w-2">
              {backendOnline ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </>
              ) : (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
                </>
              )}
            </span>
            <span className="hidden md:inline font-mono text-[11px] text-sky-400 font-bold">
              {backendOnline ? 'LIVE' : 'CONN'}
            </span>
          </div>

          {/* User Profile Pill when logged in, or Log In / Register buttons when logged out */}
          {isAuth ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs text-adaptive transition-all ${
                  activeTab === 'profile'
                    ? 'bg-sky-500/30 border-sky-400 text-sky-300 shadow-md shadow-sky-500/20'
                    : 'bg-sky-500/20 border-sky-400/30 hover:bg-sky-500/30'
                }`}
                title="My Profile & Settings"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.name}
                    className="w-4 h-4 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-3.5 h-3.5 text-sky-400" />
                )}
                <span className="font-semibold text-sky-400 max-w-[80px] truncate hidden sm:inline">
                  {user.name}
                </span>
                <span className="text-[10px] bg-sky-400/20 text-sky-300 px-1.5 py-0.5 rounded font-mono hidden md:inline">
                  My Profile
                </span>
              </button>
              <button
                onClick={handleLogoutClick}
                className="p-1.5 rounded-full hover:bg-white/10 text-adaptive-muted hover:text-red-400 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full border border-sky-400/40 text-sky-400 hover:bg-sky-500/15 font-semibold text-xs transition-all"
                title="Log In to your account"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In</span>
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1 rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-sky-600 text-white font-bold text-xs shadow-md shadow-sky-500/25 hover:scale-105 active:scale-95 transition-all"
                title="Create a new account"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Register</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
