import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Presentation,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Sparkles,
  RefreshCw,
  Layers,
  CheckCircle2,
  Tv,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import StudioSectionUploader from './StudioSectionUploader';

const SAMPLE_DECKS = [
  {
    slideNumber: 1,
    title: 'ZsyioGPT Unified AI Infrastructure',
    subtitle: 'Next-Generation Multi-Model Gateways & Spatial Media Synthesis',
    category: 'Title Slide',
    bullets: [
      'Orchestrating OpenAI, Anthropic, Gemini & Grok in one low-latency pipeline',
      'Real-time SSE token streaming and resilient failover',
      'Spatial 3D WebGL background and responsive touch ergonomics',
    ],
    highlight: 'Unified Intelligence at 60 FPS',
  },
  {
    slideNumber: 2,
    title: 'The Multi-LLM Enterprise Challenge',
    subtitle: 'Fragmentation vs Unified Convergence',
    category: 'Problem Statement',
    bullets: [
      'Enterprises currently maintain 5+ disparate API clients and billing structures',
      'Inference rate limits stall critical production customer experiences',
      'Lack of unified fallback causing service degradation during provider outages',
    ],
    highlight: '74% of AI teams report vendor lock-in friction',
  },
  {
    slideNumber: 3,
    title: 'Architectural Blueprint',
    subtitle: 'Zero-Latency Gateway & Event-Driven Workers',
    category: 'System Design',
    bullets: [
      'Edge routing layer with dynamic latency-based model switching',
      'In-memory fallback stores preserving active context state',
      'Integrated Long-form Video generator capable of multi-hour render workflows',
    ],
    highlight: 'Sub-40ms Gateway Overhead',
  },
  {
    slideNumber: 4,
    title: 'Long-Form Generative Video (Up to 3 Hours)',
    subtitle: 'Cinema-Scale Continuous Media Synthesis',
    category: 'Breakthrough Feature',
    bullets: [
      'Automated scene breakdown and storyboarding engine',
      'Cohesive character consistency across extended multi-hour sequences',
      'Multi-track audio, voiceover, and visual timeline synchronization',
    ],
    highlight: '1080p / 4K UHD Render Queues',
  },
  {
    slideNumber: 5,
    title: 'Strategic Roadmap & Future Scaling',
    subtitle: 'Continuous Evolution in 2026 and Beyond',
    category: 'Roadmap',
    bullets: [
      'Q1: Native WebGPU tensor acceleration in browser',
      'Q2: Decentralized swarm coordination for team workspaces',
      'Q3: Real-time bilateral audio-visual spatial voice streaming',
    ],
    highlight: 'Built for Scale and Resilience',
  },
];

export default function PresentationGenerator() {
  const [topic, setTopic] = useState('Next-Generation Generative AI Architecture');
  const [slides, setSlides] = useState(SAMPLE_DECKS);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [deckFiles, setDeckFiles] = useState([
    {
      id: 'demo-deck-1',
      name: 'Executive_Pitch_2026.pptx',
      size: '14.2 MB',
      type: 'presentation',
      ext: 'pptx',
      uploadedAt: 'Just now',
    },
    {
      id: 'demo-deck-2',
      name: 'Financial_Forecasts.xlsx',
      size: '3.8 MB',
      type: 'document',
      ext: 'xlsx',
      uploadedAt: '2 mins ago',
    },
  ]);

  const handleGenerateDeck = async () => {
    if (!topic.trim() || isGenerating) return;
    setIsGenerating(true);

    try {
      await new Promise((r) => setTimeout(r, 1400));
      setSlides([
        {
          slideNumber: 1,
          title: topic,
          subtitle: 'Executive Presentation & Strategic Technical Blueprint',
          category: 'Introduction',
          bullets: [
            `Core principles and strategic rationale behind ${topic}`,
            'Multi-modal integration and cloud infrastructure scaling',
            'Deliverables, milestones, and empirical success metrics',
          ],
          highlight: 'Executive Vision 2026',
        },
        {
          slideNumber: 2,
          title: 'Market Opportunity & Strategic Value',
          subtitle: 'Quantifying the Impact on Velocity',
          category: 'Market Impact',
          bullets: [
            'Immediate reduction in operational overhead and cycle times',
            'Seamless developer ergonomics with unified API endpoints',
            'Competitive advantage through early adoption of autonomous swarms',
          ],
          highlight: '4.2x Faster Time-to-Market',
        },
        {
          slideNumber: 3,
          title: 'Technical Implementation Architecture',
          subtitle: 'High-Availability Microservices',
          category: 'Architecture',
          bullets: [
            'Decoupled presentation client running Vite, React & Three.js',
            'Resilient Node.js gateway with SQLite & MongoDB hybrid stores',
            'Secure Google Firebase authentication and enterprise RBAC',
          ],
          highlight: 'Enterprise-Grade Security & 99.98% SLA',
        },
        {
          slideNumber: 4,
          title: 'Long-Form Video & Interactive Media',
          subtitle: 'Expanding Beyond Textual Intelligence',
          category: 'Media Engine',
          bullets: [
            'Generate up to 3 hours of continuous documentary or tutorial video',
            'Automated chapter segmentation and scene prompt optimization',
            'Zero-friction export for YouTube, presentation decks, and education',
          ],
          highlight: 'End-to-End Media Pipeline',
        },
        {
          slideNumber: 5,
          title: 'Actionable Next Steps & Next Milestones',
          subtitle: 'Execution Timeline and Deployment',
          category: 'Conclusion',
          bullets: [
            'Initiate sandbox pilot with cross-functional development team',
            'Connect production Firebase credentials and multi-provider keys',
            'Review analytics and continuous feedback loops weekly',
          ],
          highlight: 'Ready for Immediate Deployment',
        },
      ]);
      setCurrentSlideIndex(0);
      confetti({ particleCount: 60, spread: 60, colors: ['#38bdf8', '#ffffff'] });
    } finally {
      setIsGenerating(false);
    }
  };

  const currentSlide = slides[currentSlideIndex] || slides[0];

  return (
    <div className="space-y-8">
      {/* Deck Creator Controls */}
      <div className="glass-panel-white p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-300 text-xs font-mono mb-2">
              <Presentation className="w-3.5 h-3.5" />
              <span>AI SLIDE DECK WORKBENCH</span>
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">
              Create AI <span className="text-cyber-gradient">Presentation Decks</span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-sky-200">
              Slide {currentSlideIndex + 1} of {slides.length}
            </span>
          </div>
        </div>

        {/* Prompt Input */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Enterprise AI Swarms, Quantum Computing Breakthroughs, or Seed Round Pitch"
            className="flex-1 bg-slate-900/70 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-sky-400 transition-colors"
          />
          <button
            onClick={handleGenerateDeck}
            disabled={!topic.trim() || isGenerating}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
              topic.trim() && !isGenerating
                ? 'bg-gradient-to-r from-sky-400 via-blue-500 to-sky-600 text-white shadow-lg shadow-sky-500/30 hover:scale-105 active:scale-95'
                : 'bg-white/5 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating Slide Deck...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Build Slide Deck</span>
              </>
            )}
          </button>
        </div>

        {/* Presentation Deck Source Assets (Any format with Brand Logo) */}
        <StudioSectionUploader
          title="Slide Deck Assets & Keynote Source Files"
          subtitle="Upload any format (PPTX, PDF, XLSX, CSV, PNG graphics, JSON structures)"
          files={deckFiles}
          setFiles={setDeckFiles}
          badgeText="DECK ASSETS (ALL FORMATS)"
        />
      </div>

      {/* Main Slide Presentation Stage (Sky Blue & White Styling) */}
      <div className="relative">
        <div className="relative aspect-[16/9] w-full max-w-4xl mx-auto rounded-3xl overflow-hidden glass-panel-white p-8 sm:p-14 border border-white/30 shadow-2xl flex flex-col justify-between bg-gradient-to-br from-slate-900/90 via-slate-900/75 to-sky-950/80">
          {/* Top Slide Meta */}
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-sky-500/20 border border-sky-400/30 text-sky-300 font-mono text-xs uppercase font-bold">
              {currentSlide.category}
            </div>
            <div className="text-xs font-mono text-sky-200">
              SLIDE #{currentSlide.slideNumber}
            </div>
          </div>

          {/* Slide Content */}
          <div className="my-auto space-y-4">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-snug">
              {currentSlide.title}
            </h2>
            <p className="text-sm sm:text-lg text-sky-300 font-medium">
              {currentSlide.subtitle}
            </p>

            {/* Bullet Points */}
            <ul className="space-y-2.5 pt-2">
              {currentSlide.bullets.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-gray-200">
                  <span className="w-2 h-2 rounded-full bg-sky-400 flex-shrink-0 mt-1.5 shadow-sm shadow-sky-400" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Bottom Highlight Banner */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-sky-200 font-mono">
            <span className="font-semibold text-white">{currentSlide.highlight}</span>
            <span>ZsyioGPT Presentation Engine</span>
          </div>
        </div>

        {/* Carousel Navigation Buttons */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentSlideIndex === 0}
            className="p-3 rounded-2xl glass-panel text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Slide dots */}
          <div className="flex items-center gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`h-2.5 rounded-full transition-all ${
                  currentSlideIndex === idx ? 'w-8 bg-sky-400' : 'w-2.5 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))}
            disabled={currentSlideIndex === slides.length - 1}
            className="p-3 rounded-2xl glass-panel text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
