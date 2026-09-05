import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import AICore3D from '../components/3d/AICore3D.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Download,
  Copy,
  Maximize2,
  Wand2,
  Image as ImageIcon,
  Check,
  RefreshCw,
  Sliders,
  Zap,
  Upload,
  ChevronDown,
  FileText,
  Layers,
  X,
} from 'lucide-react';
import { downloadImageAs } from '../utils/downloader.js';

const STYLES = [
  { id: 'photorealistic', label: 'Hyper-Realistic', tag: '8k, ultra-detailed, octane render', icon: '📸' },
  { id: 'cyberpunk', label: 'Cyberpunk Neon', tag: 'volumetric light, neon glow, futuristic', icon: '🏙️' },
  { id: 'anime', label: 'Anime Studio', tag: 'makoto shinkai style, vibrant celestial', icon: '🎨' },
  { id: '3d-render', label: 'Pixar 3D Model', tag: 'unreal engine 5, claymation, cute 3d', icon: '🧸' },
  { id: 'cinematic', label: 'Cinematic Movie', tag: '35mm film, dramatic rim lighting, anamorphic', icon: '🎬' },
];

const ASPECT_RATIOS = [
  { id: '1:1', label: '1:1', desc: 'Square (Instagram/Avatar)' },
  { id: '16:9', label: '16:9', desc: 'Landscape (Desktop/Banner)' },
  { id: '9:16', label: '9:16', desc: 'Portrait (Stories/TikTok)' },
  { id: '4:3', label: '4:3', desc: 'Classic' },
];

const SAMPLE_PROMPTS = [
  "Futuristic cyberpunk cyber-samurai standing in a rain-slicked Tokyo alley, neon holographic kanji reflecting on obsidian armor, 8k resolution",
  "A glowing crystalline biomechanical hummingbird drinking nectar from a quantum flower, bioluminescent particles in deep space",
  "Portrait of an ethereal oracle priestess with golden geometric neural implants and starlight eyes, high fashion editorial lighting",
  "Floating architectural island with waterfalls falling into nebula clouds, hyper-detailed solar punk solarium",
];

export default function ImageGenPage() {
  const { user, updateCredits } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('blurry, low quality, distorted, extra limbs');
  const [selectedStyle, setSelectedStyle] = useState('photorealistic');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [gallery, setGallery] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Reference Image Upload (Image-to-Image)
  const [refImageFile, setRefImageFile] = useState(null);
  const [refImagePreview, setRefImagePreview] = useState('');
  const [refStrength, setRefStrength] = useState(0.65);
  const refFileInputRef = useRef(null);

  // Download Dropdown state
  const [downloadFormatMenuOpen, setDownloadFormatMenuOpen] = useState(false);

  // Load media history
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await api.media.getHistory();
        if (res.success && res.data) {
          const images = res.data.filter((item) => item.type === 'image');
          if (images.length > 0) {
            setGallery(images);
          } else {
            // Default seed gallery items
            setGallery([
              {
                id: 'seed-1',
                url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
                prompt: 'Ethereal fluid 3D obsidian chrome sculpture with holographic violet refraction',
                style: 'photorealistic',
                aspectRatio: '1:1',
                createdAt: new Date(),
              },
              {
                id: 'seed-2',
                url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&auto=format&fit=crop&q=80',
                prompt: 'Cybernetic neon brain core with floating data streams in hyper-space',
                style: 'cyberpunk',
                aspectRatio: '1:1',
                createdAt: new Date(),
              },
              {
                id: 'seed-3',
                url: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=800&auto=format&fit=crop&q=80',
                prompt: 'Celestial quantum matrix nebula surrounded by geometric light rings',
                style: 'cinematic',
                aspectRatio: '16:9',
                createdAt: new Date(),
              },
            ]);
          }
        }
      } catch {
        // Fallback default items
      }
    };
    loadHistory();
  }, []);

  const handleRefImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setRefImageFile(file);
      setRefImagePreview(URL.createObjectURL(file));
    }
  };

  const removeRefImage = () => {
    setRefImageFile(null);
    setRefImagePreview('');
    if (refFileInputRef.current) refFileInputRef.current.value = '';
  };

  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      let uploadedRefUrl = '';
      if (refImageFile) {
        try {
          const uploadRes = await api.files.upload(refImageFile);
          if (uploadRes.success && uploadRes.data) {
            uploadedRefUrl = uploadRes.data.file?.url || uploadRes.data?.url || '';
          }
        } catch {}
      }

      const fullPrompt = `${prompt}, ${STYLES.find((s) => s.id === selectedStyle)?.tag || ''}`;
      const res = await api.media.generateImage({
        prompt: fullPrompt,
        style: selectedStyle,
        aspectRatio,
        negativePrompt,
        referenceImageUrl: uploadedRefUrl,
        referenceStrength: refImageFile ? refStrength : undefined,
      });

      if (res.success && res.data) {
        const newImg = {
          id: res.data.id || 'img_' + Date.now(),
          url: res.data.url || res.data.imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
          prompt,
          style: selectedStyle,
          aspectRatio,
          createdAt: new Date(),
        };
        setGallery([newImg, ...gallery]);
        setSelectedImage(newImg);
        if (user?.credits) {
          updateCredits(Math.max(0, user.credits - 10));
        }
      }
    } catch (err) {
      alert('Generation failed: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSurpriseMe = () => {
    const random = SAMPLE_PROMPTS[Math.floor(Math.random() * SAMPLE_PROMPTS.length)];
    setPrompt(random);
  };

  const handleDownloadFormat = async (img, format) => {
    const safeTitle = (img.prompt || 'zsyiogpt_image').slice(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase();
    await downloadImageAs(img.url, format, safeTitle);
    setDownloadFormatMenuOpen(false);
  };

  return (
    <div className="min-h-[calc(100dvh-65px)] p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-xs font-mono mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI IMAGE GENERATION ENGINE</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Neural Image Studio</h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate photorealistic visuals, 3D renders, and image-to-image variations with multi-format downloads (PNG, JPEG, WebP, PDF).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-dark-900 border border-white/10 text-xs font-mono text-slate-300 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Cost: 10 Credits / image</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left Col: Prompt & Controls */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleGenerate} className="glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-4 sm:space-y-5">
            {/* Prompt Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Image Description Prompt</span>
                  <span className="text-brand-cyan">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleSurpriseMe}
                  className="text-[11px] text-brand-cyan hover:underline flex items-center gap-1 touch-press"
                >
                  <Wand2 className="w-3 h-3" />
                  <span>Surprise Me</span>
                </button>
              </div>
              <textarea
                rows={4}
                required
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want to create in rich visual detail..."
                className="w-full p-3 rounded-2xl glass-input text-base sm:text-xs text-white placeholder-slate-500 resize-none"
              />
            </div>

            {/* Reference Image Upload (Image-to-Image / Style Guidance) */}
            <div>
              <label className="text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
                <span>Reference Image (Image-to-Image)</span>
                <span className="text-[10px] text-slate-500 font-mono">Optional</span>
              </label>

              <input
                type="file"
                ref={refFileInputRef}
                onChange={handleRefImageSelect}
                accept="image/png,image/jpeg,image/webp,image/jpg"
                className="hidden"
              />

              {refImagePreview ? (
                <div className="relative p-2 rounded-2xl bg-dark-900 border border-brand-cyan/40 flex items-center gap-3">
                  <img src={refImagePreview} alt="Reference" className="w-14 h-14 object-cover rounded-xl border border-white/10" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{refImageFile?.name}</p>
                    <p className="text-[10px] text-brand-cyan font-mono mt-0.5">Style Reference Attached</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-slate-400 font-mono">Weight: {Math.round(refStrength * 100)}%</span>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={refStrength}
                        onChange={(e) => setRefStrength(Number(e.target.value))}
                        className="w-24 accent-brand-cyan h-1 cursor-pointer"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeRefImage}
                    className="p-1.5 rounded-full hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => refFileInputRef.current?.click()}
                  className="w-full py-3 px-4 rounded-2xl border border-dashed border-white/15 hover:border-brand-cyan/50 text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center gap-2 text-xs"
                >
                  <Upload className="w-4 h-4 text-brand-cyan" />
                  <span>Upload Reference Image (PNG, JPG, WebP)</span>
                </button>
              )}
            </div>

            {/* Negative Prompt */}
            <div>
              <label className="text-xs font-bold text-slate-300 mb-1.5 block">Negative Prompt (Avoid)</label>
              <input
                type="text"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                className="w-full p-2.5 rounded-xl glass-input text-base sm:text-xs text-white"
              />
            </div>

            {/* Styles Selector */}
            <div>
              <label className="text-xs font-bold text-slate-300 mb-2 block">Artistic Style Preset</label>
              <div className="grid grid-cols-2 gap-2">
                {STYLES.map((style) => {
                  const active = selectedStyle === style.id;
                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setSelectedStyle(style.id)}
                      className={`p-2.5 rounded-xl text-left transition-all border touch-press ${
                        active
                          ? 'bg-brand-cyan/15 border-brand-cyan text-white shadow-glow-cyan/20'
                          : 'bg-dark-900/60 border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{style.icon}</span>
                        <span className="text-xs font-semibold">{style.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Aspect Ratio */}
            <div>
              <label className="text-xs font-bold text-slate-300 mb-2 block">Aspect Ratio</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ASPECT_RATIOS.map((ar) => (
                  <button
                    key={ar.id}
                    type="button"
                    onClick={() => setAspectRatio(ar.id)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold font-mono text-center border transition-all touch-press ${
                      aspectRatio === ar.id
                        ? 'bg-brand-purple/20 border-brand-purple text-white shadow-glow-purple/30'
                        : 'bg-dark-900/60 border-white/5 text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    {ar.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!prompt.trim() || isGenerating}
              className="w-full py-3 rounded-2xl btn-neon-primary text-xs flex items-center justify-center gap-2 disabled:opacity-50 touch-press font-semibold"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Diffusion Pixels...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate AI Image (10 Credits)</span>
                </>
              )}
            </button>
          </form>

          {/* 3D Neural Pulse preview during generation */}
          {isGenerating && (
            <div className="glass-panel p-4 rounded-3xl border border-brand-cyan/30 text-center">
              <span className="text-xs font-mono text-brand-cyan">NEURAL DIFFUSION ACTIVE</span>
              <AICore3D isGenerating={true} className="h-44 w-full" />
            </div>
          )}
        </div>

        {/* Right Col: Gallery & Active Preview */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-brand-cyan" />
              <span>Generated Image Gallery ({gallery.length})</span>
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {gallery.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedImage(item)}
                className="group relative rounded-2xl overflow-hidden glass-panel border border-white/10 aspect-square cursor-pointer"
              >
                <img
                  src={item.url}
                  alt={item.prompt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                  <p className="text-[11px] text-white line-clamp-2">{item.prompt}</p>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/20">
                    <span className="text-[10px] font-mono text-brand-cyan uppercase">{item.style}</span>
                    <Maximize2 className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox Modal with Multi-Format Download */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4">
          <div className="max-w-3xl w-full glass-panel bg-dark-900 border border-white/15 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="relative aspect-video max-h-[50vh] sm:max-h-[60vh] bg-dark-950 flex items-center justify-center overflow-hidden">
              <img
                src={selectedImage.url}
                alt={selectedImage.prompt}
                className="max-w-full max-h-full object-contain"
              />
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setDownloadFormatMenuOpen(false);
                }}
                className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black/90 touch-press"
              >
                &times;
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto">
              <h4 className="text-xs font-mono text-brand-cyan mb-1 uppercase">Generated Prompt</h4>
              <p className="text-xs text-slate-200 leading-relaxed mb-4">{selectedImage.prompt}</p>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
                <div className="flex gap-2">
                  <span className="text-[10px] px-2 py-1 rounded-md bg-white/5 text-slate-400 font-mono">
                    Ratio: {selectedImage.aspectRatio || '1:1'}
                  </span>
                  <span className="text-[10px] px-2 py-1 rounded-md bg-white/5 text-slate-400 font-mono">
                    Style: {selectedImage.style}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedImage.prompt);
                      setCopiedPrompt(true);
                      setTimeout(() => setCopiedPrompt(false), 2000);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl glass-btn text-xs text-slate-300 hover:text-white"
                  >
                    {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPrompt ? 'Copied' : 'Copy Prompt'}</span>
                  </button>

                  {/* Multi-Format Download Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setDownloadFormatMenuOpen(!downloadFormatMenuOpen)}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl btn-neon-primary text-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Image</span>
                      <ChevronDown className="w-3 h-3 ml-1" />
                    </button>

                    {downloadFormatMenuOpen && (
                      <div className="absolute right-0 bottom-full mb-2 w-52 p-2 rounded-2xl glass-panel bg-dark-900/95 border border-white/15 shadow-2xl z-50">
                        <div className="text-[10px] font-mono text-slate-400 px-2 py-1 uppercase">Select Format</div>
                        <button
                          onClick={() => handleDownloadFormat(selectedImage, 'png')}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-white/5 text-slate-200"
                        >
                          <span className="font-semibold">PNG Image</span>
                          <span className="text-[10px] font-mono text-brand-cyan">Lossless (.png)</span>
                        </button>
                        <button
                          onClick={() => handleDownloadFormat(selectedImage, 'jpeg')}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-white/5 text-slate-200"
                        >
                          <span className="font-semibold">JPEG Photo</span>
                          <span className="text-[10px] font-mono text-amber-400">High-Res (.jpg)</span>
                        </button>
                        <button
                          onClick={() => handleDownloadFormat(selectedImage, 'webp')}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-white/5 text-slate-200"
                        >
                          <span className="font-semibold">WebP Modern</span>
                          <span className="text-[10px] font-mono text-emerald-400">Compressed (.webp)</span>
                        </button>
                        <button
                          onClick={() => handleDownloadFormat(selectedImage, 'pdf')}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-white/5 text-slate-200 border-t border-white/5 pt-1.5 mt-1"
                        >
                          <span className="font-semibold">PDF Document</span>
                          <span className="text-[10px] font-mono text-rose-400">Print Sheet (.pdf)</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
