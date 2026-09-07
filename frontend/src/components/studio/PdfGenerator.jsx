import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Download,
  Printer,
  Sparkles,
  RefreshCw,
  Layers,
  BookOpen,
  CheckCircle,
  BarChart3,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import StudioSectionUploader from './StudioSectionUploader';

const DOCUMENT_TEMPLATES = [
  { id: 'executive', name: 'Executive Brief', icon: BarChart3 },
  { id: 'whitepaper', name: 'Technical Whitepaper', icon: BookOpen },
  { id: 'research', name: 'AI Research Report', icon: Sparkles },
  { id: 'proposal', name: 'Project Proposal', icon: Layers },
];

export default function PdfGenerator() {
  const [template, setTemplate] = useState('executive');
  const [topic, setTopic] = useState('Autonomous Multi-Agent AI Frameworks in Enterprise Operations');
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfFiles, setPdfFiles] = useState([
    {
      id: 'pdf-f1',
      name: 'Q3_Enterprise_Benchmark_Data.csv',
      size: 1450000,
      format: 'CSV',
      date: 'Data Sheet Source',
      status: 'Ready for PDF Context',
    },
    {
      id: 'pdf-f2',
      name: 'System_Architecture_Diagram.png',
      size: 2800000,
      format: 'PNG',
      previewUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=80',
      date: 'Figure Asset',
      status: 'Ready for PDF Context',
    },
  ]);
  const [docContent, setDocContent] = useState({
    title: 'Autonomous Multi-Agent AI Frameworks in Enterprise Operations',
    subtitle: 'Strategic Architecture, Distributed Consensus, and Real-Time Telemetry',
    author: 'ZsyioGPT Research Lab',
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    summary:
      'This executive brief evaluates the architectural paradigm of deploying autonomous multi-agent systems across distributed cloud infrastructure. By replacing static pipelines with resilient, goal-driven agents, enterprise throughput improves by up to 340% while reducing inference latency across multi-modal model ensembles.',
    sections: [
      {
        heading: '1. Executive Overview & Problem Statement',
        body: 'Modern enterprises face escalating complexity in processing heterogeneous streams of unstructured multimodal data. Legacy monolithic LLM pipelines suffer from context-window degradation and single-point-of-failure bottlenecks. Autonomous swarm topologies distribute specialized cognitive tasks (parsing, validation, synthesis) across synchronized agent workers.',
      },
      {
        heading: '2. Multi-Model Routing & Latency Optimization',
        body: 'Through dynamic model routing (dynamically shifting between OpenAI GPT-4o for complex reasoning, Claude 3.5 Sonnet for deep artifact generation, and Gemini 1.5 Pro for million-token contextual ingest), the ZsyioGPT gateway reduces overall compute overhead while ensuring 99.98% operational uptime.',
      },
      {
        heading: '3. Empirical Metrics & Performance Benchmarks',
        body: 'In benchmark evaluations across 50,000 synthetic enterprise workflows, distributed agent swarms completed end-to-end tasks with 4.2x greater accuracy than single-prompt zero-shot baselines.',
      },
      {
        heading: '4. Strategic Recommendations & Roadmap',
        body: 'Organizations should implement an incremental adoption plan: phase one establishes unified gateway routing; phase two deploys self-healing memory stores; phase three connects automated media and long-form video generators.',
      },
    ],
  });

  const handleGenerateDocument = async () => {
    if (!topic.trim() || isGenerating) return;
    setIsGenerating(true);

    try {
      // Simulate intelligent document synthesis (can also stream from backend)
      await new Promise((r) => setTimeout(r, 1500));

      setDocContent({
        title: topic,
        subtitle: `Comprehensive ${DOCUMENT_TEMPLATES.find((t) => t.id === template)?.name} & Implementation Architecture`,
        author: 'ZsyioGPT Unified Intelligence Engine',
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        summary: `This report provides an in-depth analysis of ${topic}, examining key technological breakthroughs, empirical performance metrics, and implementation blueprints tailored for modern developers and enterprise decision-makers.`,
        sections: [
          {
            heading: '1. Strategic Vision & Core Objectives',
            body: `Analyzing the core imperatives of ${topic}. Through unified API routing and distributed agent nodes, teams can reduce latency while maintaining strict security compliance.`,
          },
          {
            heading: '2. Architectural Blueprint & Data Flow',
            body: 'Detailed breakdown of system layers: Client Presentation Layer, Microservices Gateway, Resilient Queue Workers, and Multimodal Vector Stores.',
          },
          {
            heading: '3. Comparative Benchmark Analysis',
            body: 'Quantitative results demonstrate superior throughput, zero-downtime failover capabilities, and reduced compute expenditures.',
          },
          {
            heading: '4. Conclusions & Next Steps',
            body: 'Actionable recommendations for rapid deployment, security hardening, and continuous metric telemetry monitoring.',
          },
        ],
      });

      confetti({
        particleCount: 60,
        spread: 60,
        colors: ['#38bdf8', '#0284c7', '#ffffff'],
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Control Configuration Card */}
      <div className="glass-panel-white p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-300 text-xs font-mono mb-2">
              <FileText className="w-3.5 h-3.5" />
              <span>AI DOCUMENT & PDF STUDIO</span>
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">
              Create Formatted <span className="text-cyber-gradient">PDF Documents</span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 font-semibold text-xs shadow-lg hover:bg-sky-50 transition-all hover:scale-105 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Export PDF / Print</span>
            </button>
          </div>
        </div>

        {/* Template Selectors */}
        <div className="mb-4">
          <label className="block text-xs font-mono uppercase text-sky-200 mb-2">
            Document Template
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {DOCUMENT_TEMPLATES.map((tmpl) => {
              const Icon = tmpl.icon;
              return (
                <button
                  key={tmpl.id}
                  onClick={() => setTemplate(tmpl.id)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold transition-all ${
                    template === tmpl.id
                      ? 'bg-sky-500/25 border-sky-400 text-white shadow-md shadow-sky-500/20'
                      : 'bg-slate-900/40 border-white/10 text-gray-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className="w-4 h-4 text-sky-400" />
                  <span>{tmpl.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Document Topic Input */}
        <div>
          <label className="block text-xs font-mono uppercase text-sky-200 mb-2">
            Report Subject / Prompt
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Next-Gen Generative AI Architecture, Quantum Computing, or Enterprise SaaS Roadmap"
              className="flex-1 bg-slate-900/70 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-sky-400 transition-colors"
            />
            <button
              onClick={handleGenerateDocument}
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
                  <span>Synthesizing Document...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Report</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* PDF Document Source Asset Uploader (Any format with Brand Logo) */}
        <StudioSectionUploader
          title="PDF Document Source & Data Assets"
          subtitle="Upload any format (CSV, JSON, DOCX, TXT, PNG charts, research PDFs)"
          files={pdfFiles}
          setFiles={setPdfFiles}
          badgeText="PDF ASSETS (ALL FORMATS)"
        />
      </div>

      {/* Live Printable Document Preview Sheet */}
      <div className="flex justify-center">
        <div
          id="pdf-document-preview"
          className="w-full max-w-4xl bg-white text-slate-900 rounded-3xl p-8 sm:p-14 shadow-2xl border border-sky-100 transition-all font-sans leading-relaxed"
        >
          {/* Header Banner */}
          <div className="border-b-2 border-sky-500/30 pb-6 mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-sky-100 text-sky-800 font-mono text-[11px] uppercase font-bold mb-2">
                {DOCUMENT_TEMPLATES.find((t) => t.id === template)?.name}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {docContent.title}
              </h1>
              <p className="text-sm font-medium text-sky-700 mt-1">{docContent.subtitle}</p>
            </div>
            <div className="text-right text-xs text-slate-500 font-mono">
              <div className="font-bold text-slate-800">{docContent.author}</div>
              <div>{docContent.date}</div>
            </div>
          </div>

          {/* Executive Summary Callout */}
          <div className="bg-sky-50/80 border-l-4 border-sky-500 p-5 rounded-r-2xl mb-8">
            <h3 className="text-xs font-mono uppercase font-bold text-sky-900 tracking-wider mb-2">
              Executive Summary
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed">{docContent.summary}</p>
          </div>

          {/* Document Sections */}
          <div className="space-y-6">
            {docContent.sections.map((sec, idx) => (
              <div key={idx} className="space-y-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-1">
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  <span>{sec.heading}</span>
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed pl-4">{sec.body}</p>
              </div>
            ))}
          </div>

          {/* Document Footer */}
          <div className="mt-12 pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Generated with ZsyioGPT AI Suite</span>
            <span>Confidential & Proprietary • Page 1 of 1</span>
          </div>
        </div>
      </div>
    </div>
  );
}
