import React, { useRef, useEffect, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Bot, Wand2, Zap, ShieldCheck, Globe2, Cpu, Layers,
  ArrowRight, Play, Star, Code, FileText, Film, Music, ChevronDown,
  CheckCircle2, MessageSquare, Brain, Infinity, Box,
} from 'lucide-react';
import BrandLogo from '../common/BrandLogo';

/* ─── Animated Counter ─────────────────────────────────────── */
function Counter({ to, suffix = '', duration = 1.8 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = to / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= to) { setCount(to); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [inView, to, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ─── Spotlight Bento Card ──────────────────────────────────── */
function BentoCard({ children, className = '', delay = 0 }) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    cardRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    cardRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      onMouseMove={handleMouseMove}
      className={`spotlight-card glass-panel rounded-3xl border border-white/15 hover:border-sky-400/50 transition-all duration-300 shadow-xl group ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* ─── Main Landing Page ─────────────────────────────────────── */
export default function LandingPage({ onOpenAuth, theme }) {
  const heroRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [activeFeature, setActiveFeature] = useState(0);

  // Parallax mouse tracking for hero
  useEffect(() => {
    const handleMove = (e) => {
      setMousePos({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  // Auto-cycle features
  useEffect(() => {
    const t = setInterval(() => setActiveFeature((p) => (p + 1) % 4), 3000);
    return () => clearInterval(t);
  }, []);

  const FEATURES = [
    { icon: Bot, label: 'Multi-LLM AI Chat', color: 'sky' },
    { icon: Film, label: '3-Hour Video Studio', color: 'purple' },
    { icon: FileText, label: 'PDF & Presentation', color: 'emerald' },
    { icon: Music, label: 'Neural Voice Synthesis', color: 'amber' },
  ];

  const STATS = [
    { value: 50, suffix: '+', label: 'AI Models Available' },
    { value: 10, suffix: 'M+', label: 'Tokens Processed Daily' },
    { value: 99.9, suffix: '%', label: 'Uptime SLA' },
    { value: 180, suffix: 'min', label: 'Max Video Length' },
  ];

  const CAPABILITY_CARDS = [
    {
      icon: Cpu,
      color: 'sky',
      badge: '5+ Providers',
      title: 'Unified Multi-LLM Intelligence',
      desc: 'Switch between GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro, and Grok. Normalized streaming with resilient retry pipelines.',
      tags: ['GPT-4o', 'Claude 3.5', 'Gemini Pro', 'Grok'],
      span: 'md:col-span-2',
    },
    {
      icon: Box,
      color: 'purple',
      badge: 'Three.js WebGL',
      title: 'Reactive 3D Spatial Canvas',
      desc: 'Hardware-accelerated 3D background with cursor tracking and lerp damping at 60 FPS.',
      span: '',
    },
    {
      icon: Zap,
      color: 'amber',
      badge: 'Zero Lag',
      title: 'Instant SSE Streaming',
      desc: 'Server-Sent Events channel delivers tokens the millisecond they are generated, with markdown rendering.',
      span: '',
    },
    {
      icon: ShieldCheck,
      color: 'emerald',
      badge: 'Firebase Auth',
      title: 'Enterprise-Grade Security',
      desc: 'Google Firebase Authentication with JWT tokens, encrypted sessions, and role-based access control.',
      span: '',
    },
    {
      icon: Layers,
      color: 'teal',
      badge: '60 FPS Physics',
      title: 'Locomotive Momentum & GSAP Motion',
      desc: 'Lenis smooth scroll + GSAP magnetic interactions for physics-based tactile UX.',
      tags: ['Smooth Wheel', 'Magnetic Pull', 'Framer Springs'],
      span: 'md:col-span-2',
    },
  ];

  const colorMap = {
    sky: { bg: 'bg-sky-500/10', border: 'border-sky-500/20', text: 'text-sky-400', hover: 'group-hover:border-sky-400/60' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', hover: 'group-hover:border-purple-400/60' },
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', hover: 'group-hover:border-amber-400/60' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', hover: 'group-hover:border-emerald-400/60' },
    teal: { bg: 'bg-teal-500/10', border: 'border-teal-500/20', text: 'text-teal-400', hover: 'group-hover:border-teal-400/60' },
  };

  return (
    <div className="relative z-10 overflow-x-hidden">
      {/* ══════════════ HERO SECTION ══════════════ */}
      <section
        ref={heroRef}
        className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-8 text-center relative pt-24 pb-16"
      >
        {/* Floating ambient blobs reacting to mouse */}
        <div
          className="pointer-events-none absolute w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(56,189,248,0.18) 0%, transparent 70%)',
            left: `${mousePos.x * 100 - 30}%`,
            top: `${mousePos.y * 100 - 30}%`,
            transform: 'translate(-50%, -50%)',
            transition: 'left 0.8s ease, top 0.8s ease',
          }}
        />
        <div
          className="pointer-events-none absolute w-[400px] h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)',
            left: `${(1 - mousePos.x) * 100}%`,
            top: `${(1 - mousePos.y) * 100 - 10}%`,
            transform: 'translate(-50%, -50%)',
            transition: 'left 1.2s ease, top 1.2s ease',
          }}
        />

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-400 text-xs font-mono mb-6 shadow-lg shadow-sky-500/10 backdrop-blur-sm"
        >
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
          <span>UNIFIED AI & MEDIA GATEWAY — v2.0</span>
          <Sparkles className="w-3.5 h-3.5" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-black leading-[1.08] tracking-tight text-adaptive max-w-5xl"
        >
          The Future of
          <br />
          <span className="text-cyber-gradient">AI-Powered</span> Creation
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-5 text-base sm:text-xl text-adaptive-muted max-w-2xl leading-relaxed"
        >
          Chat with the world's best AI models, generate 3-hour videos, craft
          PDF reports, build presentation decks, and synthesize neural audio —
          all in one unified platform.
        </motion.p>

        {/* Animated feature pill cycle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6 flex items-center justify-center gap-2 flex-wrap"
        >
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            const isActive = i === activeFeature;
            return (
              <button
                key={i}
                onClick={() => setActiveFeature(i)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 border ${
                  isActive
                    ? 'bg-sky-500/25 border-sky-400/60 text-sky-300 shadow-md shadow-sky-500/20 scale-105'
                    : 'bg-white/5 border-white/10 text-adaptive-muted hover:text-adaptive hover:bg-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{f.label}</span>
              </button>
            );
          })}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4"
        >
          {/* Primary: Get Started Free */}
          <button
            onClick={() => onOpenAuth('signup')}
            className="group relative flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-400 via-blue-500 to-sky-600 text-white font-bold text-base shadow-2xl shadow-sky-500/35 hover:shadow-sky-500/55 hover:scale-105 active:scale-95 transition-all duration-200 overflow-hidden"
          >
            {/* Shimmer */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <Sparkles className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Get Started Free</span>
            <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Secondary: Sign In */}
          <button
            onClick={() => onOpenAuth('login')}
            className="flex items-center gap-2.5 px-8 py-4 rounded-2xl glass-panel border border-sky-400/30 text-adaptive font-semibold text-base hover:border-sky-400/60 hover:bg-sky-500/10 transition-all duration-200"
          >
            <MessageSquare className="w-5 h-5 text-sky-400" />
            <span>Sign In to Chat</span>
          </button>
        </motion.div>

        {/* Trust Line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-8 flex items-center gap-3 text-adaptive-muted text-xs"
        >
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span>Trusted by 12,000+ creators & developers</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-400/15 border border-emerald-400/30 text-emerald-400 font-mono font-bold text-[10px]">
            FREE TIER
          </span>
        </motion.div>

        {/* Hero Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 w-full max-w-3xl mx-auto glass-panel rounded-3xl border border-sky-400/25 shadow-2xl shadow-sky-500/15 overflow-hidden"
        >
          {/* Window chrome */}
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/10 bg-sky-500/5">
            <span className="w-3 h-3 rounded-full bg-red-400/70" />
            <span className="w-3 h-3 rounded-full bg-amber-400/70" />
            <span className="w-3 h-3 rounded-full bg-emerald-400/70" />
            <div className="ml-3 flex items-center gap-2">
              <BrandLogo size="sm" />
              <span className="text-xs text-adaptive-muted font-mono">zsyiogpt.ai — AI Chat Cockpit</span>
            </div>
          </div>

          {/* Mock chat preview */}
          <div className="p-6 space-y-4">
            {/* AI message */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center shadow-md">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="glass-panel rounded-2xl rounded-tl-sm px-4 py-3 max-w-sm text-left">
                <p className="text-xs text-adaptive leading-relaxed">
                  Hello! I'm ZsyioGPT — powered by GPT-4o, Claude 3.5 Sonnet, and Gemini Pro. What would you like to create today? ✨
                </p>
              </div>
            </div>

            {/* User message */}
            <div className="flex items-start gap-3 justify-end">
              <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl rounded-tr-sm px-4 py-3 max-w-sm text-left">
                <p className="text-xs text-white leading-relaxed">
                  Generate a 3-hour documentary on quantum computing and export it as a PDF report
                </p>
              </div>
              <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-slate-600/60 flex items-center justify-center text-xs font-bold text-white border border-white/10">
                U
              </div>
            </div>

            {/* Typing indicator */}
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center shadow-md">
                <Sparkles className="w-4 h-4 text-white animate-pulse" />
              </div>
              <div className="glass-panel rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Input bar */}
          <div className="px-5 py-4 border-t border-white/10 bg-sky-500/3">
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-xs text-adaptive-muted flex-1">Sign up to start chatting with ZsyioGPT…</span>
              <button
                onClick={() => onOpenAuth('signup')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 text-white text-xs font-bold shadow-md hover:scale-105 transition-transform"
              >
                <Sparkles className="w-3 h-3" />
                <span>Start Free</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Scroll arrow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-adaptive-muted"
        >
          <span className="text-[10px] font-mono uppercase tracking-widest">Discover</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </motion.div>
      </section>

      {/* ══════════════ STATS BAR ══════════════ */}
      <section className="py-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto glass-panel rounded-3xl border border-white/15 px-6 py-8 grid grid-cols-2 lg:grid-cols-4 gap-6 divide-x-0 lg:divide-x divide-white/10"
        >
          {STATS.map((s, i) => (
            <div key={i} className="flex flex-col items-center text-center gap-1 px-4">
              <span className="text-3xl sm:text-4xl font-black text-cyber-gradient">
                <Counter to={s.value} suffix={s.suffix} />
              </span>
              <span className="text-xs text-adaptive-muted font-medium">{s.label}</span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ══════════════ FEATURES BENTO ══════════════ */}
      <section className="py-16 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-400 text-xs font-mono mb-4">
              <Cpu className="w-3.5 h-3.5" />
              <span>NEXT-GEN CAPABILITIES</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-adaptive tracking-tight">
              Everything you need to{' '}
              <span className="text-cyber-gradient">create & ship</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-adaptive-muted max-w-xl mx-auto leading-relaxed">
              A complete AI-powered creative workbench — from multi-model chat to cinema-scale video production.
            </p>
          </motion.div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {CAPABILITY_CARDS.map((card, i) => {
              const Icon = card.icon;
              const col = colorMap[card.color];
              return (
                <BentoCard key={i} className={`p-6 sm:p-8 ${card.span} ${col.hover}`} delay={i * 0.08}>
                  <div className={`flex items-center justify-between mb-5`}>
                    <div className={`p-3 rounded-2xl ${col.bg} border ${col.border} ${col.text} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-xs font-mono px-3 py-1 rounded-full bg-white/5 border border-white/10 ${col.text}`}>
                      {card.badge}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-adaptive mb-2">{card.title}</h3>
                  <p className="text-sm text-adaptive-muted leading-relaxed">{card.desc}</p>
                  {card.tags && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {card.tags.map((t) => (
                        <span key={t} className={`px-2.5 py-1 rounded-md ${col.bg} border ${col.border} text-xs font-mono ${col.text}`}>
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </BentoCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════ HOW IT WORKS ══════════════ */}
      <section className="py-16 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-400 text-xs font-mono mb-4">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>SIMPLE ONBOARDING</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-adaptive tracking-tight">
              Up and running in <span className="text-cyber-gradient">30 seconds</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step: '01', icon: Sparkles, color: 'sky', title: 'Create Your Account', desc: 'Sign up with Google or email in seconds. No credit card required to get started.' },
              { step: '02', icon: Brain, color: 'purple', title: 'Choose Your AI', desc: 'Pick from GPT-4o, Claude, Gemini, or Grok. Switch models anytime mid-conversation.' },
              { step: '03', icon: Infinity, color: 'emerald', title: 'Create Without Limits', desc: 'Chat, generate videos, build PDFs, synthesize audio — everything from one cockpit.' },
            ].map(({ step, icon: Icon, color, title, desc }, i) => {
              const col = colorMap[color] || colorMap.sky;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="relative glass-panel rounded-3xl p-6 border border-white/15 hover:border-sky-400/40 transition-all"
                >
                  <div className={`text-5xl font-black ${col.text} opacity-20 absolute top-4 right-6 font-mono`}>{step}</div>
                  <div className={`w-12 h-12 rounded-2xl ${col.bg} border ${col.border} flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${col.text}`} />
                  </div>
                  <h3 className="text-lg font-bold text-adaptive mb-2">{title}</h3>
                  <p className="text-sm text-adaptive-muted leading-relaxed">{desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════ FINAL CTA ══════════════ */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center glass-panel rounded-3xl border border-sky-400/25 p-10 sm:p-16 shadow-2xl shadow-sky-500/10 relative overflow-hidden"
        >
          {/* Ambient glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500/8 via-transparent to-blue-500/8 pointer-events-none" />

          <BrandLogo size="xl" withText className="justify-center mb-6" />
          <h2 className="text-3xl sm:text-5xl font-black text-adaptive tracking-tight mb-4">
            Ready to <span className="text-cyber-gradient">start creating?</span>
          </h2>
          <p className="text-adaptive-muted text-base leading-relaxed mb-8 max-w-lg mx-auto">
            Join thousands of developers, creators, and teams already building with ZsyioGPT. Free tier includes 250 credits.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onOpenAuth('signup')}
              className="group w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-sky-400 via-blue-500 to-sky-600 text-white font-bold text-base shadow-2xl shadow-sky-500/40 hover:shadow-sky-500/60 hover:scale-105 active:scale-95 transition-all duration-200 relative overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <Sparkles className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Create Free Account</span>
            </button>
            <button
              onClick={() => onOpenAuth('login')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-white/20 glass-panel text-adaptive font-semibold text-base hover:border-sky-400/50 transition-all"
            >
              <span>Already have an account?</span>
              <ArrowRight className="w-4 h-4 text-sky-400" />
            </button>
          </div>

          {/* Trust badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-adaptive-muted">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> No credit card required</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-sky-400" /> End-to-end encrypted</span>
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-400" /> 250 free credits</span>
          </div>
        </motion.div>
      </section>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer className="py-8 px-4 border-t border-white/10 text-center text-xs text-adaptive-muted">
        <div className="flex items-center justify-center gap-2 mb-2">
          <BrandLogo size="sm" withText />
        </div>
        <p>© 2026 ZsyioGPT — Unified AI & Media Gateway. All rights reserved.</p>
      </footer>
    </div>
  );
}
