import React from 'react';
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
  ShieldCheck,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'AI Chat', path: '/chat', icon: MessageSquare },
    { name: 'Image Studio', path: '/images', icon: ImageIcon },
    { name: 'Video Gen', path: '/videos', icon: VideoIcon },
    { name: 'PDF Studio', path: '/pdf', icon: FileText },
    { name: 'Analytics', path: '/usage', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/10 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand with Company Logo */}
        <Link to="/chat" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-cyan via-brand-blue to-amber-500 p-0.5 shadow-glow-cyan transition-transform group-hover:scale-105 overflow-hidden">
            <div className="w-full h-full bg-dark-950 rounded-[10px] flex items-center justify-center overflow-hidden">
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
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-wider text-white">Zsyio<span className="text-brand-cyan">GPT</span></span>
              <span className="px-1.5 py-0.5 text-[10px] uppercase font-mono tracking-widest rounded bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan">v2.5</span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Intelligent AI Solutions</p>
          </div>
        </Link>

        {/* Navigation Tabs */}
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

        {/* User & Actions */}
        <div className="flex items-center gap-3">
          {/* Credit balance */}
          <Link
            to="/usage"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-medium hover:bg-amber-500/20 transition-colors"
          >
            <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{user?.credits ?? 1000}</span>
            <span className="hidden sm:inline text-[10px] opacity-75">CR</span>
          </Link>

          {/* User state */}
          {isAuthenticated && user?.email !== 'guest@zsyiogpt.ai' ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-dark-900/80 border border-white/10">
                {user.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-6 h-6 rounded-full border border-brand-cyan/50 object-cover" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-brand-cyan to-brand-purple flex items-center justify-center text-[10px] font-bold text-black">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <span className="text-xs font-medium text-slate-200 hidden lg:inline max-w-[100px] truncate">{user.name}</span>
              </div>
              <button
                onClick={logout}
                title="Logout"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="flex items-center gap-2 px-4 py-1.5 rounded-xl btn-neon-primary text-xs"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
