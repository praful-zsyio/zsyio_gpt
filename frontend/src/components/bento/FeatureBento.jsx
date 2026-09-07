import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Cpu,
  Zap,
  Globe2,
  Box,
  Layers,
  Sparkles,
  ShieldCheck,
  Code,
  Flame,
} from 'lucide-react';

export default function FeatureBento() {
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const cards = containerRef.current.getElementsByClassName('spotlight-card');
    for (const card of cards) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-20 relative z-10"
    >
      {/* Bento Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>SKIPER UI ARCHITECTURE</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Next-Gen AI <span className="text-cyber-gradient">Capabilities</span>
        </h2>
        <p className="mt-3 text-sm sm:text-base text-gray-400">
          Engineered for hyperspeed, unified intelligence routing, and frictionless creative workflows.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Multi-Model Swarm (Span 2) */}
        <div className="spotlight-card md:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 hover:border-cyan-500/40 transition-all group shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 group-hover:scale-110 transition-transform">
              <Cpu className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/5 text-cyan-300 border border-white/10">
              5+ Providers
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
            Unified Multi-LLM Intelligence
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed mb-6 max-w-xl">
            Switch effortlessly between OpenAI GPT-4o, Anthropic Claude 3.5 Sonnet, Google Gemini 1.5 Pro, and xAI Grok. Every model runs through a normalized streaming protocol with resilient retry pipelines.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            {['GPT-4o Omnimodel', 'Claude 3.5 Sonnet', 'Gemini 1.5 Pro', 'Grok Beta'].map((name, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-surface-light/80 border border-white/5 text-gray-300 text-center">
                {name}
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: 3D Interactive Spatial Engine */}
        <div className="spotlight-card glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 hover:border-purple-500/40 transition-all group shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
              <Box className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/5 text-purple-300 border border-white/10">
              Three.js WebGL
            </span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            Reactive 3D Spatial Canvas
          </h3>
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
            Hardware-accelerated 3D background with cursor tracking and lerp damping. Reacts dynamically to scroll position and pointer coordinates at 60 FPS.
          </p>
        </div>

        {/* Card 3: Ultra-Low Latency SSE */}
        <div className="spotlight-card glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 hover:border-amber-500/40 transition-all group shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/5 text-amber-300 border border-white/10">
              Zero Lag
            </span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            Instant SSE Streaming
          </h3>
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
            Direct Server-Sent Events channel delivers tokens the millisecond they are generated by AI clusters, complete with markdown rendering and telemetry.
          </p>
        </div>

        {/* Card 4: Locomotive & Lenis Physics (Span 2) */}
        <div className="spotlight-card md:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 hover:border-emerald-500/40 transition-all group shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/5 text-emerald-300 border border-white/10">
              60 FPS Physics
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
            Locomotive Momentum & GSAP Motion
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed mb-4 max-w-xl">
            Smooth momentum scrolling inspired by Locomotive Scroll and powered by Lenis. Combined with GSAP magnetic interaction for tactile physics that make every button and card feel responsive and alive.
          </p>
          <div className="flex flex-wrap gap-2 text-xs font-mono text-emerald-300">
            <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">Smooth Wheel</span>
            <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">Magnetic Pull</span>
            <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">Framer Spring Dynamics</span>
          </div>
        </div>
      </div>
    </div>
  );
}
