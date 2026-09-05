import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Sparkles,
  MessageSquare,
  Image as ImageIcon,
  Video as VideoIcon,
  FileText,
  BarChart3,
  LogOut,
  LogIn,
  Zap,
  Menu,
  X,
  User,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const navItems = [
    { name: 'AI Chat', shortName: 'Chat', path: '/chat', icon: MessageSquare },
    { name: 'Image Studio', shortName: 'Images', path: '/images', icon: ImageIcon },
    { name: 'Video Gen', shortName: 'Videos', path: '/videos', icon: VideoIcon },
    { name: 'PDF Studio', shortName: 'PDFs', path: '/pdf', icon: FileText },
    { name: 'Analytics', shortName: 'Stats', path: '/usage', icon: BarChart3 },
  ];

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-3 sm:px-4 lg:px-8 py-2.5 sm:py-3 pt-[max(0.6rem,env(safe-area-inset-top,0px))] transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Brand with Logo */}
          <Link to="/chat" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-brand-cyan via-brand-blue to-amber-500 p-0.5 shadow-glow-cyan transition-transform group-hover:scale-105 overflow-hidden">
              <div className="w-full h-full bg-dark-950 rounded-[9px] flex items-center justify-center overflow-hidden">
                <img
                  src="/hero.jpeg"
                  alt="ZsyioGPT"
                  className="w-full h-full object-cover rounded-[9px]"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/logo.png';
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base sm:text-lg tracking-wider text-white">
                  Zsyio<span className="text-brand-cyan">GPT</span>
                </span>
                <span className="px-1.5 py-0.2 text-[9px] sm:text-[10px] uppercase font-mono tracking-widest rounded bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan">
                  v2.5
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">Intelligent AI Solutions</p>
            </div>
          </Link>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-dark-900/60 p-1.5 rounded-2xl border border-white/5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path === '/chat' && location.pathname === '/');
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-cyan/20 to-brand-purple/20 text-white border border-brand-cyan/40 shadow-glow-cyan/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-cyan' : 'text-slate-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User & Actions Area */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Credit balance */}
            <Link
              to="/usage"
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-medium hover:bg-amber-500/20 transition-colors touch-press"
            >
              <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{user?.credits ?? 1000}</span>
              <span className="hidden xs:inline text-[10px] opacity-75">CR</span>
            </Link>

            {/* Desktop User state */}
            {isAuthenticated && user?.email !== 'guest@zsyiogpt.ai' ? (
              <div className="hidden sm:flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-dark-900/80 border border-white/10">
                  {user.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-6 h-6 rounded-full border border-brand-cyan/50 object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-brand-cyan to-brand-purple flex items-center justify-center text-[10px] font-bold text-black">
                      {user.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="text-xs font-medium text-slate-200 max-w-[90px] lg:max-w-[120px] truncate">{user.name}</span>
                </div>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors touch-press"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl btn-neon-primary text-xs touch-press"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}

            {/* Mobile menu toggle (Drawer trigger) */}
            <button
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white bg-dark-900/80 border border-white/10 touch-press"
              aria-label="Toggle Navigation Menu"
            >
              {mobileDrawerOpen ? <X className="w-4 h-4 text-brand-cyan" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-over Drawer Menu */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setMobileDrawerOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer content */}
          <div className="relative w-72 max-w-[85vw] h-full bg-dark-950 border-l border-white/10 flex flex-col p-5 shadow-2xl z-10 pt-[max(1.25rem,env(safe-area-inset-top,0px))] pb-[max(1.5rem,env(safe-area-inset-bottom,0px))]">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-white">Zsyio<span className="text-brand-cyan">GPT</span></span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan font-mono">v2.5</span>
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User card in drawer */}
            <div className="my-4 p-3 rounded-2xl bg-dark-900/90 border border-white/10">
              {isAuthenticated && user?.email !== 'guest@zsyiogpt.ai' ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    {user.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="w-9 h-9 rounded-full border border-brand-cyan/50 object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-r from-brand-cyan to-brand-purple flex items-center justify-center text-xs font-bold text-black">
                        {user.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                    <span className="text-slate-400">Balance:</span>
                    <span className="font-mono font-bold text-amber-400 flex items-center gap-1">
                      <Zap className="w-3 h-3 fill-amber-400" />
                      {user?.credits ?? 1000} CR
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-slate-300 font-medium">Guest Explorer Mode</p>
                  <p className="text-[10px] text-slate-400">Sign in to sync your prompts, chat history, and unlock full quota.</p>
                  <Link
                    to="/auth"
                    onClick={() => setMobileDrawerOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl btn-neon-primary text-xs font-bold"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In / Sign Up</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Navigation links */}
            <div className="space-y-1 overflow-y-auto flex-1">
              <div className="text-[10px] font-mono text-slate-500 uppercase px-2 mb-1">Navigation Modules</div>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || (item.path === '/chat' && location.pathname === '/');
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileDrawerOpen(false)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                  </Link>
                );
              })}
            </div>

            {/* Drawer Footer Actions */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <Link
                to="/usage"
                onClick={() => setMobileDrawerOpen(false)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs"
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>Top-Up Credits</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>

              {isAuthenticated && user?.email !== 'guest@zsyiogpt.ai' && (
                <button
                  onClick={() => {
                    logout();
                    setMobileDrawerOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs hover:bg-rose-500/20 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* iOS Glassmorphic Bottom App Bar (Mobile & Tablet Portrait) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-dark-950/85 backdrop-blur-2xl border-t border-white/10 px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] shadow-[0_-8px_25px_rgba(0,0,0,0.5)]">
        <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path === '/chat' && location.pathname === '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all touch-press ${
                  isActive
                    ? 'text-brand-cyan font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`p-1 rounded-lg transition-transform ${isActive ? 'scale-110 bg-brand-cyan/15 border border-brand-cyan/40 shadow-glow-cyan/30' : ''}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                  {item.shortName}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
