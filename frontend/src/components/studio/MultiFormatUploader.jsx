import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  File,
  Image as ImageIcon,
  Film,
  Music,
  FileText,
  Code,
  Archive,
  CheckCircle2,
  Trash2,
  Download,
  Eye,
  Sparkles,
  Filter,
  Check,
  X,
  ArrowUpRight,
  Copy,
  Plus,
  Layers,
} from 'lucide-react';
import BrandLogo from '../common/BrandLogo';
import confetti from 'canvas-confetti';

const FORMAT_CATEGORIES = [
  { id: 'all', label: 'All Formats', icon: Layers },
  { id: 'document', label: 'Documents (PDF, DOCX, TXT)', icon: FileText },
  { id: 'image', label: 'Images (PNG, JPG, WEBP, SVG)', icon: ImageIcon },
  { id: 'video', label: 'Videos (MP4, MOV, WEBM)', icon: Film },
  { id: 'audio', label: 'Audio (MP3, WAV, FLAC)', icon: Music },
  { id: 'code', label: 'Code & Data (JSON, PY, JS, ZIP)', icon: Code },
];

const INITIAL_FILES = [
  {
    id: 'f-1',
    name: 'ZsyioGPT_Executive_Summary_2026.pdf',
    size: 3450000,
    type: 'document',
    format: 'PDF',
    date: 'Just now',
    status: 'Ready',
  },
  {
    id: 'f-2',
    name: 'Quantum_Neural_Interface_Render.png',
    size: 5820000,
    type: 'image',
    format: 'PNG',
    date: '10 min ago',
    status: 'Ready',
    previewUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'f-3',
    name: 'Autonomous_Agent_Dialogue_Stream.wav',
    size: 14200000,
    type: 'audio',
    format: 'WAV',
    date: '25 min ago',
    status: 'Ready',
  },
  {
    id: 'f-4',
    name: 'MultiModal_Inference_Benchmark.json',
    size: 890000,
    type: 'code',
    format: 'JSON',
    date: '1 hour ago',
    status: 'Ready',
  },
  {
    id: 'f-5',
    name: '3Hour_Europa_Documentary_Teaser.mp4',
    size: 45600000,
    type: 'video',
    format: 'MP4',
    date: '2 hours ago',
    status: 'Ready',
  },
];

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFormatMeta(file) {
  const name = file.name.toLowerCase();
  const ext = name.split('.').pop() || '';

  if (['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(ext)) {
    return { type: 'image', format: ext.toUpperCase(), color: 'from-emerald-500 to-teal-600', icon: ImageIcon };
  }
  if (['pdf', 'docx', 'doc', 'txt', 'csv', 'xlsx', 'pptx', 'md'].includes(ext)) {
    return { type: 'document', format: ext.toUpperCase(), color: 'from-sky-400 to-blue-600', icon: FileText };
  }
  if (['mp4', 'mov', 'webm', 'mkv', 'avi'].includes(ext)) {
    return { type: 'video', format: ext.toUpperCase(), color: 'from-purple-500 to-indigo-600', icon: Film };
  }
  if (['mp3', 'wav', 'flac', 'aac', 'm4a', 'ogg'].includes(ext)) {
    return { type: 'audio', format: ext.toUpperCase(), color: 'from-amber-400 to-orange-500', icon: Music };
  }
  if (['json', 'js', 'jsx', 'ts', 'tsx', 'py', 'html', 'css', 'zip', 'tar'].includes(ext)) {
    return { type: 'code', format: ext.toUpperCase(), color: 'from-cyan-400 to-sky-600', icon: Code };
  }
  return { type: 'other', format: ext.toUpperCase() || 'FILE', color: 'from-slate-400 to-slate-600', icon: File };
}

export default function MultiFormatUploader() {
  const [files, setFiles] = useState(INITIAL_FILES);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [notification, setNotification] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const fileInputRef = useRef(null);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFiles(Array.from(e.target.files));
    }
  };

  const processSelectedFiles = (newFiles) => {
    setUploadProgress(15);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setUploadProgress(null);

            const uploadedItems = newFiles.map((file, idx) => {
              const meta = getFormatMeta(file);
              return {
                id: `uploaded-${Date.now()}-${idx}`,
                name: file.name,
                size: file.size,
                type: meta.type,
                format: meta.format,
                date: 'Just now',
                status: 'Ready',
                previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
              };
            });

            setFiles((prev) => [...uploadedItems, ...prev]);
            confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
            showNotification(`Successfully processed ${newFiles.length} file(s) into ZsyioGPT Studio.`);
          }, 400);
          return 100;
        }
        return prev + 25;
      });
    }, 120);
  };

  const handleDeleteFile = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    showNotification('File removed from Studio registry.');
  };

  const handleAttachToChat = (file) => {
    try {
      const existing = JSON.parse(localStorage.getItem('zsyiogpt_chat_attached_files') || '[]');
      const updated = [
        ...existing.filter((f) => f.id !== file.id),
        { id: file.id, name: file.name, size: file.size, format: file.format },
      ];
      localStorage.setItem('zsyiogpt_chat_attached_files', JSON.stringify(updated));
      showNotification(`"${file.name}" attached to AI Chat workspace!`);
    } catch {
      showNotification(`Attached "${file.name}" to AI context.`);
    }
  };

  const filteredFiles = files.filter((f) => {
    if (selectedFilter === 'all') return true;
    return f.type === selectedFilter;
  });

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500/90 text-white text-xs font-semibold shadow-xl border border-sky-300/40 backdrop-blur-md"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Multi-Format Upload Hero Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl relative overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            {/* Brand Logo with glowing container */}
            <div className="p-3 rounded-2xl bg-gradient-to-br from-sky-400/20 to-blue-600/20 border border-sky-400/30 shadow-lg shadow-sky-500/15">
              <BrandLogo size="md" withText={false} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-adaptive tracking-tight">
                  Studio Multi-Format File Center
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-sky-400/15 border border-sky-400/30 text-[10px] font-mono text-sky-400 font-bold">
                  v2.0
                </span>
              </div>
              <p className="text-xs sm:text-sm text-adaptive-muted mt-1">
                Upload PDFs, High-Res Images, Audio, 4K Videos, and Code Datasets with instant ZsyioGPT AI recognition.
              </p>
            </div>
          </div>

          {/* Quick upload trigger button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-400 via-blue-500 to-sky-600 hover:from-sky-300 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-sky-500/25 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Upload New Files</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Drag and Drop Zone with Brand Logo Watermark */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`mt-6 border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all relative overflow-hidden ${
            isDragging
              ? 'border-sky-400 bg-sky-500/15 scale-[0.99] shadow-inner shadow-sky-500/20'
              : 'border-sky-400/30 hover:border-sky-400/60 bg-sky-500/5 hover:bg-sky-500/10'
          }`}
        >
          {/* Brand Logo in center of drop zone */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <div className="p-4 rounded-3xl bg-sky-400/10 border border-sky-400/25 flex items-center justify-center shadow-lg">
                <BrandLogo size="lg" withText={false} />
              </div>
              <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-gradient-to-tr from-sky-400 to-blue-600 text-white shadow-md">
                <UploadCloud className="w-4 h-4" />
              </div>
            </div>

            <div>
              <p className="text-sm sm:text-base font-bold text-adaptive">
                {isDragging ? 'Release files to upload to Studio' : 'Drag & drop any file here, or click to browse'}
              </p>
              <p className="text-xs text-adaptive-muted mt-1">
                Supports PDF, DOCX, PNG, JPG, MP4, MP3, WAV, JSON, ZIP & more up to 500MB
              </p>
            </div>

            {/* Supported format badges */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
              {['PDF', 'DOCX', 'PNG', 'JPG', 'WEBP', 'MP4', 'MP3', 'WAV', 'JSON', 'ZIP'].map((fmt) => (
                <span
                  key={fmt}
                  className="px-2 py-0.5 rounded-md bg-white/10 border border-white/10 text-[10px] font-mono text-adaptive-muted"
                >
                  .{fmt.toLowerCase()}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Upload Progress Bar */}
        {uploadProgress !== null && (
          <div className="mt-4 p-4 rounded-2xl bg-sky-500/10 border border-sky-400/30">
            <div className="flex justify-between items-center text-xs font-semibold text-adaptive mb-2">
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-spin" />
                <span>Processing & Vectorizing Files for AI...</span>
              </span>
              <span className="font-mono text-sky-400 font-bold">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-sky-400 to-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl glass-panel-white border border-white/15 overflow-x-auto max-w-full">
          {FORMAT_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedFilter(cat.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-md shadow-sky-500/20'
                    : 'text-adaptive-muted hover:text-adaptive hover:bg-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        <div className="text-xs text-adaptive-muted font-medium">
          Showing <span className="font-bold text-sky-400">{filteredFiles.length}</span> file(s)
        </div>
      </div>

      {/* Uploaded Files Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredFiles.map((file) => {
            const meta = getFormatMeta(file);
            const IconComponent = meta.icon;

            return (
              <motion.div
                key={file.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel p-4 rounded-2xl border border-white/15 hover:border-sky-400/40 transition-all group flex flex-col justify-between shadow-lg relative overflow-hidden"
              >
                {/* Brand Logo Watermark on top-right of every file */}
                <div className="absolute top-2.5 right-2.5 opacity-60 group-hover:opacity-100 transition-opacity">
                  <BrandLogo size="xs" withText={false} />
                </div>

                {/* File Header */}
                <div className="flex items-start gap-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${meta.color} text-white shadow-md flex-shrink-0`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1 pr-6">
                    <h3 className="text-xs sm:text-sm font-bold text-adaptive truncate" title={file.name}>
                      {file.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-adaptive-muted">
                      <span className="font-mono font-semibold text-sky-400">{file.format}</span>
                      <span>•</span>
                      <span>{formatBytes(file.size)}</span>
                      <span>•</span>
                      <span>{file.date}</span>
                    </div>
                  </div>
                </div>

                {/* Thumbnail if image */}
                {file.previewUrl && (
                  <div className="mt-3 h-28 rounded-xl overflow-hidden border border-white/10 bg-black/20 relative">
                    <img
                      src={file.previewUrl}
                      alt={file.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                {/* Action Toolbar */}
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-400/15 border border-emerald-400/30 text-emerald-400 text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{file.status}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleAttachToChat(file)}
                      className="p-1.5 rounded-lg hover:bg-sky-500/20 text-sky-400 text-xs font-semibold flex items-center gap-1 transition-colors"
                      title="Attach to AI Chat Cockpit"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Chat</span>
                    </button>

                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/20 text-adaptive-muted hover:text-red-400 transition-colors"
                      title="Delete file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredFiles.length === 0 && (
        <div className="text-center py-16 glass-panel rounded-3xl border border-white/10">
          <BrandLogo size="md" withText={false} className="mx-auto mb-3 opacity-50" />
          <p className="text-adaptive font-bold text-sm">No files in this category</p>
          <p className="text-adaptive-muted text-xs mt-1">
            Drag and drop files here or switch categories.
          </p>
        </div>
      )}
    </div>
  );
}
