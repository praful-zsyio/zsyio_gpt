import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  File,
  FileText,
  Film,
  Music,
  Image as ImageIcon,
  Code,
  CheckCircle2,
  Trash2,
  Sparkles,
  Paperclip,
  Eye,
  Plus,
} from 'lucide-react';
import BrandLogo from '../common/BrandLogo';

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function getFormatMeta(fileName = '') {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

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
  if (['json', 'js', 'jsx', 'ts', 'tsx', 'py', 'zip'].includes(ext)) {
    return { type: 'code', format: ext.toUpperCase(), color: 'from-cyan-400 to-sky-600', icon: Code };
  }
  return { type: 'other', format: ext.toUpperCase() || 'FILE', color: 'from-slate-400 to-slate-600', icon: File };
}

export default function StudioSectionUploader({
  title = 'Upload Input & Reference Files',
  subtitle = 'Upload any format of file (PDF, PNG, JPG, MP4, WAV, JSON, PPTX) to enhance AI generation',
  acceptedFormats = '*/*',
  files = [],
  setFiles,
  badgeText = 'ANY FORMAT SUPPORTED',
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (newFileList) => {
    if (!newFileList || newFileList.length === 0) return;
    setIsUploading(true);

    const incoming = Array.from(newFileList).map((file) => {
      const isImg = file.type.startsWith('image/');
      return {
        id: 'file_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        name: file.name,
        size: file.size,
        type: file.type,
        format: file.name.split('.').pop()?.toUpperCase() || 'FILE',
        previewUrl: isImg ? URL.createObjectURL(file) : null,
        date: 'Just now',
        status: 'Uploaded to Gateway',
      };
    });

    setTimeout(() => {
      setFiles((prev) => [...incoming, ...prev]);
      setIsUploading(false);
    }, 400);
  };

  const handleRemove = (id, e) => {
    e?.stopPropagation();
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-4 pt-4 border-t border-white/10">
      {/* Header with Title & Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400 font-bold uppercase tracking-wider">
            <Paperclip className="w-3.5 h-3.5" />
            <span>{title}</span>
          </div>
          <p className="text-[11px] text-adaptive-muted mt-0.5">{subtitle}</p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-400/30 text-[10px] font-mono text-sky-400 font-bold">
          <BrandLogo size="xs" withText={false} />
          <span>{badgeText}</span>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFileChange(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`relative p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center group ${
          isDragging
            ? 'border-sky-400 bg-sky-500/15 scale-[1.01]'
            : 'border-white/15 hover:border-sky-400/40 bg-white/5 hover:bg-white/[0.08]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedFormats}
          className="hidden"
          onChange={(e) => {
            handleFileChange(e.target.files);
            if (e.target) e.target.value = '';
          }}
        />

        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-400/20 to-blue-600/20 border border-sky-400/30 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-adaptive">
              Click to browse or drop any format file here
            </span>
            <p className="text-[10px] font-mono text-adaptive-muted mt-0.5">
              PDF, DOCX, PNG, JPG, MP4, WAV, JSON, PPTX & all file types supported
            </p>
          </div>
        </div>
      </div>

      {/* Uploaded Files Grid with Official Brand Logo on each file */}
      {files && files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-adaptive-muted">
            <span>Uploaded Files ({files.length})</span>
            <button
              type="button"
              onClick={() => setFiles([])}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AnimatePresence>
              {files.map((file) => {
                const meta = getFormatMeta(file.name);
                const IconComponent = meta.icon;

                return (
                  <motion.div
                    key={file.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-3 rounded-2xl glass-panel border border-white/15 hover:border-sky-400/40 transition-all flex flex-col justify-between relative overflow-hidden group shadow-md"
                  >
                    {/* Brand Logo Watermark on top-right of every uploaded file */}
                    <div
                      className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity bg-slate-900/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-sky-400/30"
                      title="Verified by ZsyioGPT"
                    >
                      <BrandLogo size="xs" withText={false} />
                      <span className="text-[9px] font-mono font-bold text-sky-400">ZsyioGPT</span>
                    </div>

                    <div className="flex items-start gap-3">
                      {/* Format Icon Badge */}
                      <div
                        className={`p-2.5 rounded-xl bg-gradient-to-br ${meta.color} text-white shadow-sm flex-shrink-0`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>

                      <div className="min-w-0 flex-1 pr-20">
                        <div className="text-xs font-bold text-adaptive truncate" title={file.name}>
                          {file.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-adaptive-muted font-mono">
                          <span className="font-bold text-sky-400">{file.format || meta.format}</span>
                          <span>•</span>
                          <span>{formatBytes(file.size)}</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-semibold">{file.status || 'Ready'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Thumbnail if image */}
                    {file.previewUrl && (
                      <div className="mt-2 h-20 rounded-xl overflow-hidden border border-white/10 bg-black/20">
                        <img
                          src={file.previewUrl}
                          alt={file.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    {/* Remove Action Button */}
                    <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                      <span className="flex items-center gap-1 text-emerald-400 font-mono font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Connected to AI</span>
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleRemove(file.id, e)}
                        className="p-1 rounded-lg hover:bg-red-500/20 text-adaptive-muted hover:text-red-400 transition-colors"
                        title="Remove file"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
