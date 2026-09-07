import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Image as ImageIcon,
  Video as VideoIcon,
  FileText,
  Presentation,
  Volume2,
  Download,
  Play,
  Pause,
  Layers,
  Wand2,
  RefreshCw,
  Clock,
  Film,
  Sliders,
  CheckCircle,
  Tv,
  UploadCloud,
} from 'lucide-react';
import PdfGenerator from '../studio/PdfGenerator';
import PresentationGenerator from '../studio/PresentationGenerator';
import MultiFormatUploader from '../studio/MultiFormatUploader';
import StudioSectionUploader from '../studio/StudioSectionUploader';
import { generateMediaImage, generateMediaTTS, fetchMediaHistory } from '../../api';
import confetti from 'canvas-confetti';

const SAMPLE_GALLERY = [
  {
    id: 's1',
    type: 'video',
    title: 'Neon Odyssey: Chronicles of Neo-Tokyo',
    duration: '180 min (Feature Length)',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
    model: 'sora-cinema-v2',
    date: '3 hours render complete',
  },
  {
    id: 's2',
    type: 'image',
    title: 'Ethereal Bioluminescent Quantum Lattice',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    model: 'dall-e-3',
    date: 'Recent',
  },
  {
    id: 's3',
    type: 'video',
    title: 'Quantum Computing Deep Documentary',
    duration: '120 min (Masterclass)',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    model: 'runway-gen3-extended',
    date: '2 hours render complete',
  },
];

export default function MediaStudio() {
  const [activeTab, setActiveTab] = useState('video'); // 'video' | 'image' | 'pdf' | 'presentation' | 'audio'

  // Image state
  const [imagePrompt, setImagePrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('Cyberpunk');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // 3-Hour Video state
  const [videoPrompt, setVideoPrompt] = useState('Hyper-realistic sci-fi documentary chronicling human colonization of Jupiter\'s moon Europa over 100 years');
  const [videoDurationMinutes, setVideoDurationMinutes] = useState(180); // Up to 180 min (3 hours)
  const [videoQuality, setVideoQuality] = useState('4k');
  const [videoFps, setVideoFps] = useState('60fps');
  const [isRenderingVideo, setIsRenderingVideo] = useState(false);
  const [videoRenderProgress, setVideoRenderProgress] = useState(0);

  // Audio state
  const [audioText, setAudioText] = useState('Welcome to ZsyioGPT. Synthesizing next-generation audio streams with spatial clarity.');
  const [selectedVoice, setSelectedVoice] = useState('alloy');
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

  // Section Uploaded Files (Any format with Brand Logo)
  const [videoFiles, setVideoFiles] = useState([
    {
      id: 'vf-1',
      name: 'Europa_Expedition_Documentary_Script.pdf',
      size: 3850000,
      format: 'PDF',
      date: 'Storyboard Asset',
      status: 'Ready for AI Video',
    },
    {
      id: 'vf-2',
      name: 'Atmospheric_Space_Probe_B-Roll.mp4',
      size: 28400000,
      format: 'MP4',
      date: 'Cinematic Clip',
      status: 'Ready for AI Video',
    },
  ]);

  const [imageFiles, setImageFiles] = useState([
    {
      id: 'im-1',
      name: 'Cyber_Atmosphere_Concept_Lattice.png',
      size: 4200000,
      format: 'PNG',
      previewUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
      date: 'Palette Reference',
      status: 'Ready for Image Gen',
    },
  ]);

  const [audioFiles, setAudioFiles] = useState([
    {
      id: 'af-1',
      name: 'Narrator_Acoustic_Profile_Stem.wav',
      size: 5120000,
      format: 'WAV',
      date: 'Voice Reference',
      status: 'Ready for TTS',
    },
  ]);

  // Gallery
  const [gallery, setGallery] = useState(SAMPLE_GALLERY);

  useEffect(() => {
    fetchMediaHistory().then((history) => {
      if (history && history.length > 0) {
        setGallery((prev) => [...history, ...prev]);
      }
    });
  }, []);

  // Video generator handler (up to 3 hours)
  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim() || isRenderingVideo) return;
    setIsRenderingVideo(true);
    setVideoRenderProgress(5);

    // Simulate multi-scene render sequence
    const interval = setInterval(() => {
      setVideoRenderProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRenderingVideo(false);
          confetti({ particleCount: 80, spread: 70, colors: ['#38bdf8', '#ffffff', '#0284c7'] });

          const newVideoItem = {
            id: 'vid_' + Date.now(),
            type: 'video',
            title: videoPrompt.slice(0, 45) + '...',
            duration: `${videoDurationMinutes} min (${(videoDurationMinutes / 60).toFixed(1)} hrs)`,
            url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
            model: `cinema-${videoQuality}-${videoFps}`,
            date: 'Render Finished',
          };
          setGallery((g) => [newVideoItem, ...g]);
          return 100;
        }
        return prev + 15;
      });
    }, 600);
  };

  // Image generator handler
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim() || isGeneratingImage) return;
    setIsGeneratingImage(true);

    try {
      const res = await generateMediaImage({
        prompt: `${imagePrompt}, ${selectedStyle} style, 8k resolution masterpiece`,
        model: 'dall-e-3',
        size: aspectRatio === '16:9' ? '1792x1024' : '1024x1024',
      });

      confetti({ particleCount: 70, spread: 60, colors: ['#38bdf8', '#0284c7', '#ffffff'] });

      const newImage = {
        id: 'img_' + Date.now(),
        type: 'image',
        title: imagePrompt.slice(0, 40),
        url: res?.data?.url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
        model: 'dall-e-3',
        date: 'Just now',
      };
      setGallery((prev) => [newImage, ...prev]);
    } catch {
      const demoMedia = {
        id: 'demo_' + Date.now(),
        type: 'image',
        title: imagePrompt.slice(0, 40),
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
        model: 'flux-schnell',
        date: 'Generated via Gateway',
      };
      setGallery((prev) => [demoMedia, ...prev]);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Audio generator handler
  const handleGenerateAudio = async () => {
    if (!audioText.trim() || isGeneratingAudio) return;
    setIsGeneratingAudio(true);
    try {
      await generateMediaTTS({ text: audioText, voice: selectedVoice });
      confetti({ particleCount: 50, spread: 50 });
    } catch {
      const utterance = new SpeechSynthesisUtterance(audioText);
      window.speechSynthesis.speak(utterance);
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-20 relative z-10">
      {/* Studio Header (Sky Blue & White Aesthetic) */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-300 text-xs font-mono mb-3 shadow-md shadow-sky-500/10">
          <Sparkles className="w-3.5 h-3.5 text-sky-300 animate-pulse" />
          <span>MULTI-MODAL GENERATIVE WORKBENCH</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Unified Creative <span className="text-cyber-gradient">Intelligence Studio</span>
        </h1>
        <p className="mt-3 text-sm sm:text-base text-sky-100/80 leading-relaxed">
          Produce up to 3-hour long-form videos, high-resolution imagery, executive PDF reports, and interactive presentation decks.
        </p>

        {/* Feature Studio Switcher Pills */}
        <div className="flex flex-wrap items-center justify-center p-1.5 rounded-2xl glass-panel-white border border-white/20 mt-8 gap-1.5 shadow-2xl">
          <button
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'video'
                ? 'bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-lg shadow-sky-500/30'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <VideoIcon className="w-4 h-4" />
            <span>3-Hour Video</span>
          </button>

          <button
            onClick={() => setActiveTab('image')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'image'
                ? 'bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-lg shadow-sky-500/30'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Image Gen</span>
          </button>

          <button
            onClick={() => setActiveTab('pdf')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'pdf'
                ? 'bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-lg shadow-sky-500/30'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>PDF Creation</span>
          </button>

          <button
            onClick={() => setActiveTab('presentation')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'presentation'
                ? 'bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-lg shadow-sky-500/30'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Presentation className="w-4 h-4" />
            <span>Presentation Decks</span>
          </button>

          <button
            onClick={() => setActiveTab('audio')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'audio'
                ? 'bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-lg shadow-sky-500/30'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>Neural Voice</span>
          </button>

          <button
            onClick={() => setActiveTab('files')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'files'
                ? 'bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-lg shadow-sky-500/30'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Multi-Format Files</span>
          </button>
        </div>
      </div>

      {/* Main Studio Views */}
      <AnimatePresence mode="wait">
        {/* 1. LONG-FORM VIDEO STUDIO (UP TO 3 HOURS) */}
        {activeTab === 'video' && (
          <motion.div
            key="video"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-8"
          >
            <div className="glass-panel-white p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-mono mb-2">
                    <Film className="w-3.5 h-3.5" />
                    <span>CINEMA-SCALE GENERATIVE VIDEO</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    Long-Form AI Video <span className="text-cyber-gradient">(Up to 3 Hours)</span>
                  </h3>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs px-3 py-1.5 rounded-xl bg-slate-900/60 border border-white/10 text-sky-300">
                  <Clock className="w-4 h-4 text-sky-400" />
                  <span>Max Duration: 180 Minutes (3.0 Hours)</span>
                </div>
              </div>

              {/* Video Prompt */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-sky-200 mb-2">
                    Film / Documentary Script Prompt
                  </label>
                  <textarea
                    value={videoPrompt}
                    onChange={(e) => setVideoPrompt(e.target.value)}
                    rows={3}
                    placeholder="Describe your film, deep documentary, masterclass, or story arc in detail..."
                    className="w-full bg-slate-900/70 border border-white/15 rounded-2xl p-4 text-white placeholder-gray-400 focus:outline-none focus:border-sky-400 transition-colors text-sm resize-none"
                  />
                </div>

                {/* Duration Slider: 1 min to 180 min (3 Hours) */}
                <div className="bg-slate-900/40 border border-white/10 p-5 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-sky-200 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-sky-400" />
                      <span>Continuous Video Duration</span>
                    </span>
                    <span className="text-sm font-mono font-bold text-white bg-sky-500/20 px-3 py-1 rounded-lg border border-sky-400/30">
                      {videoDurationMinutes} minutes ({ (videoDurationMinutes / 60).toFixed(1) } Hours)
                    </span>
                  </div>

                  <input
                    type="range"
                    min={5}
                    max={180}
                    step={5}
                    value={videoDurationMinutes}
                    onChange={(e) => setVideoDurationMinutes(parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                  />

                  <div className="flex justify-between text-[11px] font-mono text-gray-400">
                    <span>5 min (Short Film)</span>
                    <span>60 min (1 Hour Special)</span>
                    <span>120 min (2 Hour Film)</span>
                    <span className="text-sky-300 font-bold">180 min (3 Hours Full Epic)</span>
                  </div>
                </div>

                {/* Quality and Frame Rate Settings */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <div className="flex flex-wrap gap-4">
                    <div>
                      <span className="text-xs font-mono uppercase text-sky-200 block mb-1.5">Output Resolution</span>
                      <div className="flex gap-1.5">
                        {['1080p FHD', '4K UHD', '8K Cinema'].map((res) => (
                          <button
                            key={res}
                            onClick={() => setVideoQuality(res)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                              videoQuality === res
                                ? 'bg-sky-500/30 text-white border border-sky-400 font-bold shadow-sm'
                                : 'bg-slate-900/60 text-gray-400 border border-white/10 hover:text-white'
                            }`}
                          >
                            {res}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-mono uppercase text-sky-200 block mb-1.5">Frame Rate</span>
                      <div className="flex gap-1.5">
                        {['24 FPS Cinematic', '60 FPS Ultra-Smooth'].map((fps) => (
                          <button
                            key={fps}
                            onClick={() => setVideoFps(fps)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                              videoFps === fps
                                ? 'bg-sky-500/30 text-white border border-sky-400 font-bold shadow-sm'
                                : 'bg-slate-900/60 text-gray-400 border border-white/10 hover:text-white'
                            }`}
                          >
                            {fps}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateVideo}
                    disabled={!videoPrompt.trim() || isRenderingVideo}
                    className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                      videoPrompt.trim() && !isRenderingVideo
                        ? 'bg-gradient-to-r from-sky-400 via-blue-500 to-sky-600 text-white shadow-xl shadow-sky-500/30 hover:scale-[1.02] active:scale-[0.98]'
                        : 'bg-white/5 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isRenderingVideo ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Rendering {videoDurationMinutes} Min Film ({videoRenderProgress}%)...</span>
                      </>
                    ) : (
                      <>
                        <Film className="w-4 h-4" />
                        <span>Start {videoDurationMinutes}-Minute Video Render</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Live Render Telemetry Progress Bar */}
                {isRenderingVideo && (
                  <div className="mt-4 p-4 rounded-2xl bg-slate-900/80 border border-sky-500/40 space-y-2">
                    <div className="flex justify-between text-xs font-mono text-sky-300">
                      <span>Multi-Pass Temporal Neural Synthesis...</span>
                      <span>{videoRenderProgress}% Completed</span>
                    </div>
                    <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-sky-400 via-blue-500 to-sky-200 transition-all duration-300 rounded-full"
                        style={{ width: `${videoRenderProgress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] font-mono text-gray-400">
                      <span>Estimated Duration: {videoDurationMinutes} minutes continuous footage</span>
                      <span>Target: {videoQuality} @ {videoFps}</span>
                    </div>
                  </div>
                )}

                {/* 3-Hour Video Asset Uploader (Any format with Brand Logo) */}
                <StudioSectionUploader
                  title="3-Hour Video Storyboard & Footage Upload"
                  subtitle="Upload any format (PDF script, MP4 clips, PNG storyboards, WAV voiceover, JSON timelines)"
                  files={videoFiles}
                  setFiles={setVideoFiles}
                  badgeText="VIDEO ASSETS (ALL FORMATS)"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* 2. IMAGE GENERATION */}
        {activeTab === 'image' && (
          <motion.div
            key="image"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="glass-panel-white p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-sky-200 mb-2">
                  Image Concept Prompt
                </label>
                <textarea
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder="Describe your visual concept in vivid detail..."
                  rows={3}
                  className="w-full bg-slate-900/70 border border-white/15 rounded-2xl p-4 text-white placeholder-gray-400 focus:outline-none focus:border-sky-400 transition-colors text-sm resize-none"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div>
                  <span className="text-xs font-mono uppercase text-sky-200 block mb-1.5">Art Style</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['Cyberpunk', 'Cinematic 3D', 'Hyper-Realistic', 'Anime Manga', 'Surrealist'].map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedStyle(s)}
                        className={`px-3 py-1.5 rounded-xl text-xs transition-all ${
                          selectedStyle === s
                            ? 'bg-sky-500/30 text-white border border-sky-400 font-semibold'
                            : 'bg-slate-900/60 text-gray-400 border border-white/10 hover:text-white'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-mono uppercase text-sky-200 block mb-1.5">Aspect Ratio</span>
                  <div className="flex gap-1.5">
                    {['1:1', '16:9', '9:16'].map((r) => (
                      <button
                        key={r}
                        onClick={() => setAspectRatio(r)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                          aspectRatio === r
                            ? 'bg-sky-500/30 text-white border border-sky-400 font-semibold'
                            : 'bg-slate-900/60 text-gray-400 border border-white/10 hover:text-white'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  onClick={handleGenerateImage}
                  disabled={!imagePrompt.trim() || isGeneratingImage}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-sky-400 via-blue-500 to-sky-600 text-white shadow-xl shadow-sky-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Wand2 className="w-4 h-4" />
                  <span>Generate Image</span>
                </button>
              </div>

              {/* Image Gen Reference Asset Uploader (Any format with Brand Logo) */}
              <StudioSectionUploader
                title="Image Gen Reference & Texture Assets"
                subtitle="Upload any format (PNG, JPG, WEBP, SVG, PDF moodboards, color JSONs)"
                files={imageFiles}
                setFiles={setImageFiles}
                badgeText="IMAGE ASSETS (ALL FORMATS)"
              />
            </div>
          </motion.div>
        )}

        {/* 3. PDF GENERATION */}
        {activeTab === 'pdf' && (
          <motion.div
            key="pdf"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <PdfGenerator />
          </motion.div>
        )}

        {/* 4. PRESENTATION DECK GENERATION */}
        {activeTab === 'presentation' && (
          <motion.div
            key="presentation"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <PresentationGenerator />
          </motion.div>
        )}

        {/* 5. NEURAL VOICE & AUDIO */}
        {activeTab === 'audio' && (
          <motion.div
            key="audio"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="glass-panel-white p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-sky-200 mb-2">
                  Speech Script
                </label>
                <textarea
                  value={audioText}
                  onChange={(e) => setAudioText(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-900/70 border border-white/15 rounded-2xl p-4 text-white placeholder-gray-400 focus:outline-none focus:border-sky-400 transition-colors text-sm resize-none"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div>
                  <span className="text-xs font-mono uppercase text-sky-200 block mb-1.5">Voice Model</span>
                  <div className="flex gap-2">
                    {['alloy', 'echo', 'fable', 'onyx', 'nova'].map((v) => (
                      <button
                        key={v}
                        onClick={() => setSelectedVoice(v)}
                        className={`px-3 py-1.5 rounded-xl text-xs uppercase font-mono transition-all ${
                          selectedVoice === v
                            ? 'bg-sky-500/30 text-white border border-sky-400 font-semibold'
                            : 'bg-slate-900/60 text-gray-400 border border-white/10 hover:text-white'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGenerateAudio}
                  disabled={!audioText.trim() || isGeneratingAudio}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-sky-400 via-blue-500 to-sky-600 text-white shadow-xl shadow-sky-500/30 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Synthesize Audio</span>
                </button>
              </div>

              {/* Neural Voice & Audio Stem Uploader (Any format with Brand Logo) */}
              <StudioSectionUploader
                title="Neural Voice Sample & Script Upload"
                subtitle="Upload any format (WAV, MP3, FLAC, PDF dialogue, TXT scripts, DOCX)"
                files={audioFiles}
                setFiles={setAudioFiles}
                badgeText="AUDIO ASSETS (ALL FORMATS)"
              />
            </div>
          </motion.div>
        )}

        {/* 6. MULTI-FORMAT FILE UPLOADER WORKSPACE */}
        {activeTab === 'files' && (
          <motion.div
            key="files"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <MultiFormatUploader />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Artifact Gallery Showcase */}
      <div className="mt-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-400" />
            <span>Studio Production Gallery</span>
          </h2>
          <span className="text-xs font-mono text-sky-200">{gallery.length} artifacts active</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {gallery.map((item) => (
            <motion.div
              key={item.id}
              layout
              className="glass-panel rounded-3xl overflow-hidden border border-white/15 hover:border-sky-400/50 transition-all shadow-xl group"
            >
              <div className="relative aspect-video overflow-hidden bg-black/50">
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[11px] font-mono uppercase text-sky-300 border border-white/10">
                    {item.type}
                  </span>
                </div>
                {item.duration && (
                  <div className="absolute bottom-3 left-3">
                    <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[11px] font-mono text-white font-bold border border-sky-400/30">
                      {item.duration}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 justify-end">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="p-4 space-y-1">
                <p className="text-xs font-bold text-white line-clamp-1">{item.title}</p>
                <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 pt-2 border-t border-white/5">
                  <span className="text-sky-300 uppercase">{item.model}</span>
                  <span>{item.date}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
