import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Camera,
  Upload,
  Save,
  Key,
  ShieldCheck,
  Zap,
  Sparkles,
  RefreshCw,
  Check,
  Cpu,
  Mail,
  Sliders,
  Database,
  Download,
  Trash2,
  Lock,
  Volume2,
  Eye,
  CreditCard,
  FileJson,
  AlertTriangle,
  Sun,
  Moon,
  MessageSquare,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { apiClient } from '../../api/client';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
];

export default function ProfilePage({ user, onUpdateUser, theme, setTheme, toggleTheme, onOpenPayment }) {
  const fileInputRef = useRef(null);
  const [activeSection, setActiveSection] = useState('profile'); // 'profile' | 'settings' | 'data' | 'billing' | 'api'

  // Profile fields
  const [name, setName] = useState(user?.name || 'User');
  const [email, setEmail] = useState(user?.email || 'user@zsyiogpt.com');
  const [bio, setBio] = useState(user?.bio || 'AI Architect & Generative Media Creator');
  const [avatar, setAvatar] = useState(
    user?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
  );

  // Settings & Preferences
  const [preferredModel, setPreferredModel] = useState(user?.preferredModel || 'gpt-4o');
  const [temperature, setTemperature] = useState(0.7);
  const [streamingEnabled, setStreamingEnabled] = useState(true);
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);

  // API Keys
  const [openaiKey, setOpenaiKey] = useState(localStorage.getItem('zsyiogpt_custom_openai_key') || '');
  const [claudeKey, setClaudeKey] = useState(localStorage.getItem('zsyiogpt_custom_claude_key') || '');
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem('zsyiogpt_custom_gemini_key') || '');
  const [grokKey, setGrokKey] = useState(localStorage.getItem('zsyiogpt_custom_grok_key') || '');

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [dataMessage, setDataMessage] = useState(null);

  // Handle local image file upload
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save profile & preferences
  const handleSave = () => {
    const updated = {
      ...user,
      name,
      email,
      bio,
      photoURL: avatar,
      preferredModel,
      temperature,
      streamingEnabled,
      voiceSpeed,
    };

    localStorage.setItem('zsyiogpt_user', JSON.stringify(updated));
    if (openaiKey) localStorage.setItem('zsyiogpt_custom_openai_key', openaiKey);
    if (claudeKey) localStorage.setItem('zsyiogpt_custom_claude_key', claudeKey);
    if (geminiKey) localStorage.setItem('zsyiogpt_custom_gemini_key', geminiKey);
    if (grokKey) localStorage.setItem('zsyiogpt_custom_grok_key', grokKey);

    onUpdateUser(updated);

    confetti({
      particleCount: 70,
      spread: 60,
      colors: ['#38bdf8', '#0284c7', '#ffffff'],
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Export Data Controls (JSON download)
  const handleExportData = () => {
    const exportPayload = {
      userProfile: { name, email, bio, avatar, credits: user?.credits },
      preferences: { preferredModel, temperature, streamingEnabled, voiceSpeed },
      exportedAt: new Date().toISOString(),
      app: 'ZsyioGPT Workspace',
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zsyiogpt_workspace_export_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setDataMessage('Workspace data successfully exported as JSON!');
    setTimeout(() => setDataMessage(null), 4000);
  };

  // Chat History & App Data state
  const [conversationsList, setConversationsList] = useState([]);

  const loadConversations = () => {
    try {
      const saved = localStorage.getItem('zsyiogpt_local_conversations');
      if (saved) {
        setConversationsList(JSON.parse(saved));
      } else {
        setConversationsList([]);
      }
    } catch {
      setConversationsList([]);
    }
  };

  useEffect(() => {
    loadConversations();
    const handleSync = () => loadConversations();
    window.addEventListener('zsyiogpt_chat_history_cleared', handleSync);
    return () => window.removeEventListener('zsyiogpt_chat_history_cleared', handleSync);
  }, []);

  const handleDeleteConversation = (id) => {
    const filtered = conversationsList.filter((c) => (c._id || c.id) !== id);
    setConversationsList(filtered);
    localStorage.setItem('zsyiogpt_local_conversations', JSON.stringify(filtered));
    setDataMessage('Selected chat conversation was removed from the app.');
    setTimeout(() => setDataMessage(null), 3000);
  };

  // Clear All Chat History and App State
  const handleClearAllHistory = async () => {
    localStorage.removeItem('zsyiogpt_local_conversations');
    setConversationsList([]);
    try {
      await apiClient.delete('/conversations');
    } catch {
      // ignore
    }
    window.dispatchEvent(new Event('zsyiogpt_chat_history_cleared'));
    setDataMessage('All chat history and cached conversations have been cleared from the app and database!');
    setTimeout(() => setDataMessage(null), 4000);
  };

  // Clear Cache Control
  const handleClearCache = async () => {
    localStorage.removeItem('zsyiogpt_local_conversations');
    setConversationsList([]);
    try {
      await apiClient.delete('/conversations');
    } catch {
      // ignore
    }
    window.dispatchEvent(new Event('zsyiogpt_chat_history_cleared'));
    setDataMessage('Local chat cache, app logs, and database sessions cleared successfully.');
    setTimeout(() => setDataMessage(null), 4000);
  };

  const SECTIONS = [
    { id: 'profile', name: 'Profile & Avatar', icon: User },
    { id: 'settings', name: 'Settings & Logic', icon: Sliders },
    { id: 'data', name: 'Data Control & Privacy', icon: Database },
    { id: 'billing', name: 'Billing & Credits', icon: CreditCard },
    { id: 'api', name: 'API Security & Keys', icon: Key },
  ];

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 pt-24 pb-20 relative z-10">
      {/* Profile Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-400 text-xs font-mono mb-3">
          <User className="w-3.5 h-3.5" />
          <span>SETTINGS & WORKSPACE CONTROL</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-adaptive tracking-tight">
          Account & <span className="text-cyber-gradient">Data Management</span>
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-adaptive-muted">
          Customize your profile, adjust AI parameters, control your data privacy, and manage subscriptions.
        </p>
      </div>

      {/* Clickable Section Navigation Bar */}
      <div className="flex flex-wrap items-center justify-center p-1.5 rounded-2xl glass-panel border border-white/15 gap-1.5 mb-8 shadow-lg">
        {SECTIONS.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-sky-400 via-blue-500 to-sky-600 text-white shadow-md shadow-sky-500/25 scale-[1.02]'
                  : 'text-adaptive-muted hover:text-adaptive hover:bg-white/10'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{sec.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Avatar Card */}
        <div className="glass-panel p-6 rounded-3xl border border-white/15 space-y-6 flex flex-col items-center text-center shadow-xl h-fit">
          {/* Avatar with Camera Overlay */}
          <div className="relative group">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-2 border-sky-400/50 shadow-2xl shadow-sky-500/20 bg-slate-900">
              <img
                src={avatar}
                alt="Profile Avatar"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 p-2.5 rounded-2xl bg-gradient-to-tr from-sky-400 to-blue-600 text-white shadow-lg hover:scale-110 active:scale-95 transition-all"
              title="Upload New Avatar Image"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageFileChange}
            />
          </div>

          <div>
            <h2 className="text-lg font-bold text-adaptive">{name}</h2>
            <p className="text-xs text-adaptive-muted">{email}</p>
          </div>

          {/* Preset Avatars Selector */}
          <div className="w-full">
            <span className="text-[11px] font-mono uppercase text-adaptive-muted block mb-2">
              Preset Avatars
            </span>
            <div className="flex justify-center gap-2">
              {PRESET_AVATARS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setAvatar(p)}
                  className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-all ${
                    avatar === p ? 'border-sky-400 scale-105 shadow-md shadow-sky-400/40' : 'border-white/10 hover:border-white/40'
                  }`}
                >
                  <img src={p} alt="Preset" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Credits Badge & Buy Credits Trigger */}
          <div className="w-full pt-4 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-mono text-adaptive-muted flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Credits</span>
              </span>
              <span className="text-sm font-bold font-mono text-amber-400 bg-amber-400/10 px-3 py-1 rounded-lg border border-amber-400/20">
                {user?.credits?.toLocaleString() || 250} cr
              </span>
            </div>

            {onOpenPayment && (
              <button
                type="button"
                onClick={onOpenPayment}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-400/20 to-sky-400/20 border border-amber-400/30 hover:border-amber-400/60 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Zap className="w-3.5 h-3.5 fill-amber-400" />
                <span>Top-Up AI Credits</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Active Section Panel (Span 2) */}
        <div className="md:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl border border-white/15 shadow-xl space-y-6">
          {/* Header & Status Indicator */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-base font-bold text-adaptive flex items-center gap-2">
              <span>{SECTIONS.find((s) => s.id === activeSection)?.name}</span>
            </h3>
            {savedSuccess && (
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                <Check className="w-3.5 h-3.5" />
                <span>Preferences Saved</span>
              </span>
            )}
            {dataMessage && (
              <span className="text-xs font-mono text-sky-400 flex items-center gap-1 bg-sky-500/10 px-2.5 py-1 rounded-md border border-sky-400/20">
                <Check className="w-3.5 h-3.5" />
                <span>{dataMessage}</span>
              </span>
            )}
          </div>

          {/* SECTION 1: PROFILE & IDENTITY */}
          {activeSection === 'profile' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-adaptive-muted mb-1.5">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-adaptive-input border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-sky-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-adaptive-muted mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-adaptive-input border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-sky-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-adaptive-muted mb-1.5">
                  Bio / Specialization
                </label>
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Lead Prompt Architect & Generative Artist"
                  className="w-full bg-adaptive-input border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-sky-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-adaptive-muted mb-1.5">
                  Default Reasoning Model
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['gpt-4o', 'claude-3-5-sonnet-20241022', 'gemini-1.5-pro', 'grok-beta'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPreferredModel(m)}
                      className={`p-2 rounded-xl text-xs font-mono text-center border transition-all ${
                        preferredModel === m
                          ? 'bg-sky-500/25 border-sky-400 text-sky-400 font-bold shadow-sm'
                          : 'border-white/10 text-adaptive-muted hover:border-white/25'
                      }`}
                    >
                      {m.split('-')[0].toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: SETTINGS & LOGIC */}
          {activeSection === 'settings' && (
            <div className="space-y-5">
              {/* Dark & Light Theme Customization */}
              <div className="p-4 rounded-2xl glass-panel border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-adaptive flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span>Interface Theme & Styling</span>
                    </div>
                    <p className="text-[11px] text-adaptive-muted">
                      Customize app appearance with dark or light color scheme
                    </p>
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-400 font-bold uppercase">
                    {theme || 'dark'} Mode Active
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setTheme && setTheme('dark')}
                    className={`flex items-center justify-center gap-2.5 p-3 rounded-xl border text-xs font-bold transition-all ${
                      theme === 'dark'
                        ? 'bg-slate-900 border-sky-400 text-sky-400 shadow-md shadow-sky-500/20 ring-2 ring-sky-400/40'
                        : 'bg-white/5 border-white/10 text-adaptive-muted hover:border-white/30 hover:text-adaptive'
                    }`}
                  >
                    <Moon className="w-4 h-4 text-sky-400" />
                    <span>Dark Mode (Sky & Slate)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme && setTheme('light')}
                    className={`flex items-center justify-center gap-2.5 p-3 rounded-xl border text-xs font-bold transition-all ${
                      theme === 'light'
                        ? 'bg-white border-sky-500 text-sky-600 shadow-md shadow-sky-500/20 ring-2 ring-sky-500/40'
                        : 'bg-white/5 border-white/10 text-adaptive-muted hover:border-white/30 hover:text-adaptive'
                    }`}
                  >
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>Light Mode (Clean Sky & White)</span>
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-mono uppercase text-adaptive-muted">
                    Reasoning Temperature ({temperature})
                  </label>
                  <span className="text-xs font-mono text-sky-400 font-bold">
                    {temperature < 0.4 ? 'Precise & Deterministic' : temperature > 0.8 ? 'Creative & Unconstrained' : 'Balanced'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-mono uppercase text-adaptive-muted">
                    Speech Voice Playback Rate ({voiceSpeed}x)
                  </label>
                  <span className="text-xs font-mono text-sky-400 font-bold">
                    {voiceSpeed === 1 ? 'Normal' : `${voiceSpeed}x Speed`}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="1.5"
                  step="0.05"
                  value={voiceSpeed}
                  onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                />
              </div>

              <div className="p-4 rounded-2xl glass-panel border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-adaptive">Server-Sent Events (SSE) Streaming</div>
                  <div className="text-[11px] text-adaptive-muted">Receive AI tokens the millisecond they are synthesized</div>
                </div>
                <input
                  type="checkbox"
                  checked={streamingEnabled}
                  onChange={(e) => setStreamingEnabled(e.target.checked)}
                  className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* SECTION 3: DATA CONTROL & PRIVACY */}
          {activeSection === 'data' && (
            <div className="space-y-4">
              {/* App Chat History Section with Clear All Data */}
              <div className="p-4 rounded-2xl glass-panel border border-white/10 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-adaptive">
                    <MessageSquare className="w-4 h-4 text-sky-400" />
                    <span>App Chat History & Saved Sessions ({conversationsList.length})</span>
                  </div>
                  {conversationsList.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllHistory}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-bold hover:bg-red-500/30 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear All Chat History</span>
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-adaptive-muted">
                  Review and manage your conversation logs saved across AI models in this app.
                </p>

                {conversationsList.length === 0 ? (
                  <div className="text-center py-4 text-xs text-adaptive-muted bg-white/5 rounded-xl border border-white/5">
                    No active chat history stored in the app. Conversations you start will appear here.
                  </div>
                ) : (
                  <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
                    {conversationsList.map((c) => {
                      const id = c._id || c.id;
                      return (
                        <div
                          key={id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs hover:border-sky-400/30 transition-all"
                        >
                          <div className="truncate flex-1 pr-3">
                            <div className="font-semibold text-adaptive truncate">
                              {c.title || 'Conversation Session'}
                            </div>
                            <div className="text-[10px] text-adaptive-muted font-mono mt-0.5">
                              {c.model || 'gpt-4o'} • {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Recent'}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteConversation(id)}
                            className="p-1.5 rounded-lg hover:bg-red-500/20 text-adaptive-muted hover:text-red-400 transition-colors"
                            title="Delete this conversation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Complete Workspace JSON Export */}
              <div className="p-4 rounded-2xl glass-panel border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-adaptive">
                  <FileJson className="w-4 h-4 text-sky-400" />
                  <span>Export Complete Workspace Data</span>
                </div>
                <p className="text-[11px] text-adaptive-muted leading-relaxed">
                  Download a JSON file containing all saved conversation histories, user preferences, and workspace settings.
                </p>
                <button
                  type="button"
                  onClick={handleExportData}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500/20 border border-sky-400/40 text-sky-400 font-bold text-xs hover:bg-sky-500/30 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON Archive</span>
                </button>
              </div>

              {/* Clear Local Cache & State */}
              <div className="p-4 rounded-2xl glass-panel border border-red-500/20 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-red-400">
                  <Trash2 className="w-4 h-4 text-red-400" />
                  <span>Clear All App Data & Local Cache</span>
                </div>
                <p className="text-[11px] text-adaptive-muted leading-relaxed">
                  Purge locally saved conversation logs, temporary uploads, and UI states stored in your browser across all app features.
                </p>
                <button
                  type="button"
                  onClick={handleClearCache}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 font-bold text-xs hover:bg-red-500/30 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear App Cache & Reset State</span>
                </button>
              </div>
            </div>
          )}

          {/* SECTION 4: BILLING & CREDITS */}
          {activeSection === 'billing' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl glass-panel border border-white/10 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-mono text-adaptive-muted uppercase block mb-1">
                    Current Active Plan
                  </span>
                  <div className="text-xl font-extrabold text-adaptive flex items-center gap-2">
                    <span>{user?.plan === 'pro' ? 'ZsyioGPT Pro Workspace' : 'Free Starter Plan'}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-400 text-xs font-mono font-bold">
                      ACTIVE
                    </span>
                  </div>
                  <p className="text-xs text-adaptive-muted mt-1">
                    Balance: <strong className="text-amber-400 font-mono">{user?.credits?.toLocaleString() || 250} credits</strong>
                  </p>
                </div>

                {onOpenPayment && (
                  <button
                    onClick={onOpenPayment}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-400 via-blue-500 to-sky-600 text-white font-bold text-xs shadow-md shadow-sky-500/25 hover:scale-105 active:scale-95 transition-all"
                  >
                    Top-Up / Upgrade
                  </button>
                )}
              </div>

              <div className="text-xs text-adaptive-muted font-mono p-4 rounded-2xl glass-panel border border-white/10 space-y-1">
                <div className="font-bold text-adaptive">Inference Usage Estimates:</div>
                <div>• GPT-4o Omni Chat: ~1 credit / 1,000 tokens</div>
                <div>• DALL-E 3 Image Generation: ~10 credits / image</div>
                <div>• 3-Hour Long-Form Video: ~100 credits / hour</div>
              </div>
            </div>
          )}

          {/* SECTION 5: API SECURITY & BYO KEYS */}
          {activeSection === 'api' && (
            <div className="space-y-4">
              <p className="text-xs text-adaptive-muted">
                Bring your own keys to bypass platform credit quotas and run requests directly against your provider accounts.
              </p>

              <div>
                <label className="block text-[11px] font-mono text-adaptive-muted mb-1">
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  placeholder="sk-proj-..."
                  className="w-full bg-adaptive-input border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-sky-400 font-mono transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-adaptive-muted mb-1">
                  Anthropic Claude Key
                </label>
                <input
                  type="password"
                  value={claudeKey}
                  onChange={(e) => setClaudeKey(e.target.value)}
                  placeholder="sk-ant-..."
                  className="w-full bg-adaptive-input border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-sky-400 font-mono transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-adaptive-muted mb-1">
                  Google Gemini Key
                </label>
                <input
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-adaptive-input border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-sky-400 font-mono transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-adaptive-muted mb-1">
                  xAI Grok Key
                </label>
                <input
                  type="password"
                  value={grokKey}
                  onChange={(e) => setGrokKey(e.target.value)}
                  placeholder="xai-..."
                  className="w-full bg-adaptive-input border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-sky-400 font-mono transition-colors"
                />
              </div>
            </div>
          )}

          {/* Bottom Save Trigger */}
          <div className="pt-3 border-t border-white/10 flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-400 via-blue-500 to-sky-600 text-white font-bold text-xs shadow-lg shadow-sky-500/25 hover:scale-105 active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Workspace Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
