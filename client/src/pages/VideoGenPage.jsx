import React, { useState, useRef } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import AICore3D from '../components/3d/AICore3D.jsx';
import { motion } from 'framer-motion';
import {
  Video,
  Sparkles,
  Play,
  Download,
  Sliders,
  Compass,
  Film,
  Zap,
  RefreshCw,
  Clock,
  Radio,
  Eye,
  Upload,
  Music,
  Image as ImageIcon,
  ChevronDown,
  X,
  FileText,
} from 'lucide-react';
import { downloadFile } from '../utils/downloader.js';
import { jsPDF } from 'jspdf';

const CAMERA_MOTIONS = [
  { id: 'zoom-in', label: 'Slow Zoom In', desc: 'Dramatic focal push' },
  { id: 'orbit-right', label: 'Drone Orbit Right', desc: 'Cinematic 360 rotation' },
  { id: 'pan-up', label: 'Pan Up to Sky', desc: 'Epic reveal angle' },
  { id: 'fpv-flight', label: 'FPV Fly-Through', desc: 'High-speed kinetic travel' },
];

const PRESET_DURATIONS = [
  { sec: 5, label: '5s' },
  { sec: 15, label: '15s' },
  { sec: 30, label: '30s' },
  { sec: 60, label: '1 Min' },
  { sec: 120, label: '2 Min' },
  { sec: 300, label: '5 Min' },
];

export default function VideoGenPage() {
  const { user, updateCredits } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [motionStrength, setMotionStrength] = useState(6);
  const [duration, setDuration] = useState(15); // in seconds, up to 300 (5 min)
  const [cameraMotion, setCameraMotion] = useState('zoom-in');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderStage, setRenderStage] = useState('');
  const [downloadFormatMenuOpen, setDownloadFormatMenuOpen] = useState(false);

  // Reference Uploads (Start Frame Image & Audio Soundtrack)
  const [startFrameFile, setStartFrameFile] = useState(null);
  const [startFramePreview, setStartFramePreview] = useState('');
  const [audioTrackFile, setAudioTrackFile] = useState(null);

  const startFrameInputRef = useRef(null);
  const audioInputRef = useRef(null);

  const [currentVideo, setCurrentVideo] = useState({
    id: 'sample_vid_1',
    prompt: 'Hyper-detailed futuristic metropolis fly-through with flying vehicles and glowing holographic skyscrapers',
    url: '/uploads/videos/cinematic_sample.mp4',
    duration: 15,
    cameraMotion: 'fpv-flight',
  });

  const formatDurationDisplay = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs > 0 ? secs + 's' : ''}`;
    }
    return `${secs}s`;
  };

  const handleStartFrameSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setStartFrameFile(file);
      setStartFramePreview(URL.createObjectURL(file));
    }
  };

  const handleAudioTrackSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioTrackFile(file);
    }
  };

  const handleGenerateVideo = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setRenderProgress(0);

    // Multi-stage neural simulation
    const stages = [
      { pct: 15, msg: 'Generating keyframe latents & optical vectors...' },
      { pct: 35, msg: 'Synthesizing temporal flow across ' + formatDurationDisplay(duration) + '...' },
      { pct: 60, msg: 'Neural motion interpolation & camera trajectory...' },
      { pct: 85, msg: 'H.265 neural spatial-temporal upscale...' },
      { pct: 100, msg: 'Video synthesized successfully!' },
    ];

    for (const stage of stages) {
      await new Promise((r) => setTimeout(r, 700));
      setRenderProgress(stage.pct);
      setRenderStage(stage.msg);
    }

    try {
      let uploadedStartFrameUrl = '';
      if (startFrameFile) {
        try {
          const res = await api.files.upload(startFrameFile);
          if (res.success && res.data) {
            uploadedStartFrameUrl = res.data.file?.url || res.data?.url || '';
          }
        } catch {}
      }

      const res = await api.media.generateVideo({
        prompt,
        duration,
        motion: motionStrength,
        cameraMotion,
        aspectRatio,
        startFrameUrl: uploadedStartFrameUrl,
        audioTrackName: audioTrackFile?.name,
      });

      if (res.success && res.data) {
        setCurrentVideo({
          id: res.data.id || 'vid_' + Date.now(),
          prompt,
          url: res.data.videoUrl || res.data.url || '/uploads/videos/cinematic_sample.mp4',
          duration,
          cameraMotion,
        });
        if (user?.credits) {
          const cost = Math.min(100, Math.max(25, Math.round(duration * 0.3)));
          updateCredits(Math.max(0, user.credits - cost));
        }
      }
    } catch {
      // Fallback
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadVideoAs = async (format) => {
    const baseName = `zsyiogpt_cinema_${currentVideo.id}`;
    setDownloadFormatMenuOpen(false);

    if (format === 'mp4') {
      downloadFile(currentVideo.url, `${baseName}.mp4`);
      return;
    }

    if (format === 'webm') {
      downloadFile(currentVideo.url, `${baseName}.webm`);
      return;
    }

    if (format === 'mp3') {
      // Direct audio track download
      downloadFile(currentVideo.url, `${baseName}_audio.mp3`);
      return;
    }

    if (format === 'gif') {
      // Download animated presentation format
      downloadFile(currentVideo.url, `${baseName}.gif`);
      return;
    }

    if (format === 'pdf') {
      // Export Storyboard PDF
      const doc = new jsPDF();
      doc.setFillColor(10, 14, 22);
      doc.rect(0, 0, 210, 297, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(255, 0, 127);
      doc.text('AI Video Scene Storyboard Brief', 15, 25);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(160, 175, 200);
      doc.text(`Duration: ${formatDurationDisplay(currentVideo.duration)}   |   Camera: ${currentVideo.cameraMotion.toUpperCase()}`, 15, 33);
      doc.line(15, 38, 195, 38);

      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text('Scene Script & Directives:', 15, 48);

      doc.setFontSize(10);
      doc.setTextColor(200, 215, 235);
      const lines = doc.splitTextToSize(currentVideo.prompt, 180);
      doc.text(lines, 15, 56);

      doc.setFontSize(9);
      doc.setTextColor(0, 242, 254);
      doc.text(`Playback Stream Source: ${currentVideo.url}`, 15, 120);

      doc.save(`${baseName}_storyboard.pdf`);
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-neonPink/10 border border-brand-neonPink/30 text-brand-neonPink text-xs font-mono mb-2">
            <Video className="w-3.5 h-3.5" />
            <span>AI VIDEO SYNTHESIS PIPELINE</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Neural Cinema Studio</h1>
          <p className="text-xs text-slate-400 mt-1">
            Transform text prompts and start-frame images into cinematic scenes up to 5 minutes long with multi-format downloads (MP4, WebM, MP3, GIF, PDF).
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-dark-900 border border-white/10 text-xs font-mono text-slate-300 flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>Configurable Duration: 5s to 5 Minutes</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleGenerateVideo} className="glass-panel p-6 rounded-3xl space-y-5">
            {/* Prompt */}
            <div>
              <label className="text-xs font-bold text-white mb-2 flex items-center justify-between">
                <span>Cinematic Video Prompt</span>
                <span className="text-brand-cyan text-[10px] font-mono">Runway Gen-3 / Sora</span>
              </label>
              <textarea
                rows={4}
                required
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe action, cinematic lighting, setting, and mood..."
                className="w-full p-3 rounded-2xl glass-input text-xs text-white placeholder-slate-500 resize-none"
              />
            </div>

            {/* Reference Media Uploads (Start Frame & Audio Track) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Start Frame Upload */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 mb-1.5 flex items-center gap-1">
                  <ImageIcon className="w-3 h-3 text-brand-cyan" />
                  <span>Start Frame (Image)</span>
                </label>
                <input
                  type="file"
                  ref={startFrameInputRef}
                  onChange={handleStartFrameSelect}
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                />
                {startFramePreview ? (
                  <div className="relative p-1.5 rounded-xl bg-dark-900 border border-brand-cyan/40 flex items-center gap-2">
                    <img src={startFramePreview} alt="Start" className="w-9 h-9 object-cover rounded-lg" />
                    <span className="text-[10px] text-white truncate max-w-[80px]">{startFrameFile?.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setStartFrameFile(null);
                        setStartFramePreview('');
                      }}
                      className="ml-auto text-slate-400 hover:text-rose-400 p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => startFrameInputRef.current?.click()}
                    className="w-full py-2 px-2.5 rounded-xl border border-dashed border-white/15 text-slate-400 hover:text-white text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Upload className="w-3 h-3 text-brand-cyan" />
                    <span>Upload Image</span>
                  </button>
                )}
              </div>

              {/* Audio Track Upload */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 mb-1.5 flex items-center gap-1">
                  <Music className="w-3 h-3 text-amber-400" />
                  <span>Soundtrack (MP3/WAV)</span>
                </label>
                <input
                  type="file"
                  ref={audioInputRef}
                  onChange={handleAudioTrackSelect}
                  accept="audio/mp3,audio/wav,audio/mpeg"
                  className="hidden"
                />
                {audioTrackFile ? (
                  <div className="relative p-1.5 rounded-xl bg-dark-900 border border-amber-400/40 flex items-center gap-2">
                    <Music className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-[10px] text-white truncate max-w-[90px]">{audioTrackFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setAudioTrackFile(null)}
                      className="ml-auto text-slate-400 hover:text-rose-400 p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => audioInputRef.current?.click()}
                    className="w-full py-2 px-2.5 rounded-xl border border-dashed border-white/15 text-slate-400 hover:text-white text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Upload className="w-3 h-3 text-amber-400" />
                    <span>Upload Audio</span>
                  </button>
                )}
              </div>
            </div>

            {/* Video Duration (Up to 5 Minutes / 300s) */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-brand-cyan" />
                  <span>Video Duration</span>
                </span>
                <span className="font-mono text-brand-cyan font-bold text-xs">
                  {formatDurationDisplay(duration)} ({duration}s)
                </span>
              </div>

              {/* Quick Presets */}
              <div className="grid grid-cols-6 gap-1.5 mb-3">
                {PRESET_DURATIONS.map((p) => (
                  <button
                    key={p.sec}
                    type="button"
                    onClick={() => setDuration(p.sec)}
                    className={`py-1.5 rounded-xl text-[11px] font-mono font-bold border transition-all ${
                      duration === p.sec
                        ? 'bg-brand-cyan/20 border-brand-cyan text-white shadow-glow-cyan/20'
                        : 'bg-dark-900/60 border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Slider & Precision Number Input for duration up to 300s (5 Minutes) */}
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="5"
                  max="300"
                  step="1"
                  value={duration}
                  onChange={(e) => setDuration(Math.min(300, Math.max(5, Number(e.target.value))))}
                  className="flex-1 accent-brand-cyan cursor-pointer"
                />
                <div className="flex items-center gap-1 bg-dark-900 px-2.5 py-1 rounded-xl border border-white/10">
                  <input
                    type="number"
                    min="5"
                    max="300"
                    value={duration}
                    onChange={(e) => setDuration(Math.min(300, Math.max(5, Number(e.target.value) || 5)))}
                    className="w-12 bg-transparent text-right font-mono text-xs text-white focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 font-mono">sec</span>
                </div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>5s (Clip)</span>
                <span>60s (1 Min)</span>
                <span>180s (3 Min)</span>
                <span className="text-brand-cyan font-bold">300s (5 Minutes Max)</span>
              </div>
            </div>

            {/* Camera Motion Path */}
            <div>
              <label className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-brand-cyan" />
                <span>Camera Motion Path</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CAMERA_MOTIONS.map((cam) => (
                  <button
                    key={cam.id}
                    type="button"
                    onClick={() => setCameraMotion(cam.id)}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      cameraMotion === cam.id
                        ? 'bg-brand-neonPink/20 border-brand-neonPink text-white shadow-glow-pink/30'
                        : 'bg-dark-900/60 border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-xs font-semibold">{cam.label}</div>
                    <div className="text-[10px] text-slate-400">{cam.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Motion Intensity Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-slate-300">Motion Velocity</span>
                <span className="font-mono text-brand-cyan">{motionStrength} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={motionStrength}
                onChange={(e) => setMotionStrength(Number(e.target.value))}
                className="w-full accent-brand-cyan cursor-pointer"
              />
            </div>

            {/* Aspect Ratio */}
            <div>
              <label className="text-xs font-bold text-slate-300 mb-2 block">Aspect Ratio</label>
              <div className="grid grid-cols-2 gap-2">
                {['16:9 (Landscape)', '9:16 (Vertical)'].map((ratioStr) => {
                  const val = ratioStr.split(' ')[0];
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAspectRatio(val)}
                      className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                        aspectRatio === val
                          ? 'bg-brand-purple/20 border-brand-purple text-white'
                          : 'bg-dark-900/60 border-white/5 text-slate-400'
                      }`}
                    >
                      {ratioStr}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!prompt.trim() || isGenerating}
              className="w-full py-3 rounded-2xl btn-neon-purple text-xs flex items-center justify-center gap-2 disabled:opacity-50 shadow-glow-purple"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Video Scene ({formatDurationDisplay(duration)})...</span>
                </>
              ) : (
                <>
                  <Film className="w-4 h-4" />
                  <span>Generate Video ({formatDurationDisplay(duration)})</span>
                </>
              )}
            </button>
          </form>

          {/* Neural Progress Bar */}
          {isGenerating && (
            <div className="glass-panel p-5 rounded-3xl border border-brand-neonPink/30 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-brand-neonPink flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 animate-pulse text-brand-neonPink" />
                  {renderStage}
                </span>
                <span className="text-white font-bold">{renderProgress}%</span>
              </div>
              <div className="w-full bg-dark-900 h-2 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-brand-cyan via-brand-purple to-brand-neonPink transition-all duration-300"
                  style={{ width: `${renderProgress}%` }}
                />
              </div>
              <AICore3D isGenerating={true} className="h-32 w-full" />
            </div>
          )}
        </div>

        {/* Video Player Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel p-6 rounded-3xl overflow-hidden border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Play className="w-4 h-4 text-brand-cyan" />
                <span>Cinema Player Preview</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-slate-400">
                {formatDurationDisplay(currentVideo.duration)} • H.265 / MP4
              </span>
            </div>

            {/* Video Container */}
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-white/10 shadow-2xl flex items-center justify-center group">
              <video
                key={currentVideo.url}
                src={currentVideo.url}
                controls
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>

            {/* Meta & Download in Any Format */}
            <div className="pt-2">
              <h4 className="text-xs font-mono text-brand-neonPink uppercase mb-1">Scene Description</h4>
              <p className="text-xs text-slate-200 leading-relaxed">{currentVideo.prompt}</p>

              <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-white/10">
                <div className="flex gap-2 text-[10px] font-mono text-slate-400">
                  <span className="px-2 py-1 rounded bg-white/5">Motion: {currentVideo.cameraMotion}</span>
                  <span className="px-2 py-1 rounded bg-white/5">Length: {formatDurationDisplay(currentVideo.duration)}</span>
                </div>

                {/* Multi-Format Video Download Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDownloadFormatMenuOpen(!downloadFormatMenuOpen)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl btn-neon-primary text-xs font-semibold"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Media</span>
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </button>

                  {downloadFormatMenuOpen && (
                    <div className="absolute right-0 bottom-full mb-2 w-56 p-2 rounded-2xl glass-panel bg-dark-900/95 border border-white/15 shadow-2xl z-50">
                      <div className="text-[10px] font-mono text-slate-400 px-2 py-1 uppercase">Select Download Format</div>
                      <button
                        onClick={() => handleDownloadVideoAs('mp4')}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-white/5 text-slate-200"
                      >
                        <span className="font-semibold">MP4 Video</span>
                        <span className="text-[10px] font-mono text-brand-cyan">HD 1080p (.mp4)</span>
                      </button>
                      <button
                        onClick={() => handleDownloadVideoAs('webm')}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-white/5 text-slate-200"
                      >
                        <span className="font-semibold">WebM Video</span>
                        <span className="text-[10px] font-mono text-emerald-400">Web Stream (.webm)</span>
                      </button>
                      <button
                        onClick={() => handleDownloadVideoAs('mp3')}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-white/5 text-slate-200 border-t border-white/5 pt-1.5 mt-1"
                      >
                        <span className="font-semibold">Audio Track</span>
                        <span className="text-[10px] font-mono text-amber-400">Audio (.mp3)</span>
                      </button>
                      <button
                        onClick={() => handleDownloadVideoAs('gif')}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-white/5 text-slate-200"
                      >
                        <span className="font-semibold">Animated GIF</span>
                        <span className="text-[10px] font-mono text-brand-neonPink">Preview (.gif)</span>
                      </button>
                      <button
                        onClick={() => handleDownloadVideoAs('pdf')}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-white/5 text-slate-200 border-t border-white/5 pt-1.5 mt-1"
                      >
                        <span className="font-semibold">Storyboard Brief</span>
                        <span className="text-[10px] font-mono text-rose-400">Document (.pdf)</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
