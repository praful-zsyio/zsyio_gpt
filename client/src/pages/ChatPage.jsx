import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import AICore3D from '../components/3d/AICore3D.jsx';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Paperclip,
  Sparkles,
  Bot,
  User,
  Zap,
  Plus,
  Trash2,
  Cpu,
  ChevronDown,
  Wand2,
  Copy,
  Check,
  FileCode,
  Layers,
  Download,
  FileText,
  Film,
  Music,
  FileSpreadsheet,
  Image as ImageIcon,
  File,
  Upload,
  ChevronUp,
  Loader2,
  FolderUp,
  X,
  History,
} from 'lucide-react';
import { exportChatTranscript } from '../utils/downloader.js';

const AVAILABLE_MODELS = [
  { id: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash', provider: 'Firebase GenAI', badge: 'Firebase SDK Native', color: 'from-amber-400 to-rose-500' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', badge: 'Flagship Multimodal', color: 'from-emerald-400 to-cyan-500' },
  { id: 'claude-3-7-sonnet', name: 'Claude 3.7 Sonnet', provider: 'Anthropic', badge: 'Thinking Reasoning', color: 'from-amber-400 to-orange-500' },
  { id: 'gemini-2-flash', name: 'Gemini 2.0 Flash', provider: 'Google', badge: 'Ultra Fast Real-Time', color: 'from-blue-400 to-indigo-500' },
  { id: 'grok-2', name: 'Grok 2', provider: 'xAI', badge: 'Uncensored Real-Time', color: 'from-purple-400 to-pink-500' },
];

export default function ChatPage() {
  const { user, updateCredits } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [isStreaming, setIsStreaming] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [showCostarModal, setShowCostarModal] = useState(false);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);

  // CO-STAR builder fields
  const [costar, setCostar] = useState({
    context: '',
    objective: '',
    style: 'Technical and insightful',
    tone: 'Professional & friendly',
    audience: 'Developers & Founders',
    responseFormat: 'Markdown with code snippets and tables',
  });

  const [showUploadSection, setShowUploadSection] = useState(true);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  // Load conversations on mount
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const res = await api.conversations.list();
        if (res.success && res.data) {
          setConversations(res.data);
          if (res.data.length > 0 && !currentConversationId) {
            loadConversation(res.data[0]._id || res.data[0].id);
          }
        }
      } catch (err) {
        console.warn('Failed to load conversations', err);
      }
    };
    loadConversations();
  }, []);

  const loadConversation = async (id) => {
    setCurrentConversationId(id);
    try {
      const res = await api.conversations.get(id);
      if (res.success && res.data) {
        setMessages(res.data.messages || []);
      }
    } catch {
      // Fallback
    }
  };

  const handleNewChat = () => {
    setCurrentConversationId(null);
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `👋 Hello ${user?.name || 'there'}! I am your unified AI assistant powered by **OpenAI, Claude, Gemini, and Grok**.\n\nSelect any model from the top selector, attach files, or craft deep prompts with the **CO-STAR Architect** below. How can I assist you today?`,
        model: selectedModel,
        createdAt: new Date(),
      },
    ]);
  };

  // Initial welcome message if empty
  useEffect(() => {
    if (messages.length === 0 && !currentConversationId) {
      handleNewChat();
    }
  }, [currentConversationId]);

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const res = await api.files.upload(file);
          if (res.success && res.data) {
            const fileData = res.data.file || res.data;
            setAttachments((prev) => [
              ...prev,
              {
                name: file.name,
                mimeType: file.type || 'application/octet-stream',
                size: file.size,
                url: fileData.url,
                extractedText: fileData.extractedText || '',
              },
            ]);
          }
        } catch (err) {
          alert(`Upload failed for ${file.name}: ` + err.message);
        }
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    let convId = currentConversationId;
    if (!convId) {
      convId = 'conv_' + Date.now();
      setCurrentConversationId(convId);
      setConversations((prev) => [
        { _id: convId, id: convId, title: trimmed.slice(0, 30) + '...', model: selectedModel },
        ...prev,
      ]);
    }

    const userMsg = {
      id: 'usr_' + Date.now(),
      role: 'user',
      content: trimmed,
      attachments: [...attachments],
      createdAt: new Date(),
    };

    const botMsgId = 'bot_' + Date.now();
    const initialBotMsg = {
      id: botMsgId,
      role: 'assistant',
      content: '',
      model: selectedModel,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMsg, initialBotMsg]);
    setInput('');
    setAttachments([]);
    setIsStreaming(true);

    let accumulatedContent = '';

    await api.messages.stream({
      conversationId: convId,
      content: trimmed,
      model: selectedModel,
      attachments: userMsg.attachments,
      onChunk: (chunk) => {
        accumulatedContent += chunk.delta || '';
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMsgId ? { ...msg, content: accumulatedContent } : msg
          )
        );
        if (chunk.outputTokens && user?.credits) {
          updateCredits(Math.max(0, user.credits - 2));
        }
      },
      onDone: () => {
        setIsStreaming(false);
      },
      onError: (errMsg) => {
        setIsStreaming(false);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMsgId
              ? { ...msg, content: accumulatedContent + `\n\n*(Error: ${errMsg})*` }
              : msg
          )
        );
      },
    });
  };

  const copyMessage = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExport = (format) => {
    exportChatTranscript(messages, format, AVAILABLE_MODELS.find((m) => m.id === selectedModel)?.name);
    setExportDropdownOpen(false);
  };

  const applyCostarPrompt = () => {
    const prompt = `[CONTEXT]: ${costar.context}\n[OBJECTIVE]: ${costar.objective}\n[STYLE]: ${costar.style}\n[TONE]: ${costar.tone}\n[AUDIENCE]: ${costar.audience}\n[RESPONSE FORMAT]: ${costar.responseFormat}`;
    setInput(prompt);
    setShowCostarModal(false);
  };

  const getAttachmentIcon = (mimeType = '') => {
    if (mimeType.includes('pdf')) return <FileText className="w-3.5 h-3.5 text-rose-400" />;
    if (mimeType.includes('image')) return <ImageIcon className="w-3.5 h-3.5 text-brand-cyan" />;
    if (mimeType.includes('video')) return <Film className="w-3.5 h-3.5 text-brand-neonPink" />;
    if (mimeType.includes('audio')) return <Music className="w-3.5 h-3.5 text-amber-400" />;
    if (mimeType.includes('csv') || mimeType.includes('spreadsheet')) return <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />;
    return <File className="w-3.5 h-3.5 text-slate-400" />;
  };

  return (
    <div className="h-[calc(100dvh-55px)] md:h-[calc(100dvh-65px)] flex overflow-hidden bg-dark-950 text-slate-100 relative">
      {/* Desktop Sidebar: Chat History */}
      <aside className="w-64 lg:w-72 hidden md:flex flex-col border-r border-white/10 glass-panel bg-dark-950/80 p-4">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl btn-neon-primary text-xs mb-4 touch-press"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat Session</span>
        </button>

        <div className="text-[11px] font-mono text-slate-500 uppercase px-2 mb-2">History & Sessions</div>
        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {conversations.length === 0 ? (
            <div className="text-center text-xs text-slate-500 py-8">No saved chats yet</div>
          ) : (
            conversations.map((c) => {
              const active = c._id === currentConversationId || c.id === currentConversationId;
              return (
                <button
                  key={c._id || c.id}
                  onClick={() => loadConversation(c._id || c.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between group transition-colors ${
                    active ? 'bg-white/10 text-white font-medium border border-brand-cyan/30' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`}
                >
                  <span className="truncate pr-2">{c.title || 'Untitled Chat'}</span>
                  <span className="text-[10px] font-mono opacity-50 uppercase">{c.model?.split('-')[0] || 'AI'}</span>
                </button>
              );
            })
          )}
        </div>

        {/* 3D Mini Widget in Sidebar */}
        <div className="mt-auto pt-3 border-t border-white/10">
          <div className="p-3 rounded-2xl bg-dark-900/90 border border-white/10">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono text-brand-cyan uppercase">Neural Status</span>
              <span className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-brand-neonPink animate-ping' : 'bg-emerald-400'}`} />
            </div>
            <AICore3D isGenerating={isStreaming} className="h-24 w-full" />
            <p className="text-[10px] text-center text-slate-400 mt-1">Multi-Gateway Core Active</p>
          </div>
        </div>
      </aside>

      {/* Mobile Chat History Drawer (iPhone & iPad portrait) */}
      {mobileHistoryOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            onClick={() => setMobileHistoryOpen(false)}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />
          <div className="relative w-80 max-w-[85vw] h-full bg-dark-950 border-r border-white/10 flex flex-col p-4 z-10 pt-[max(1rem,env(safe-area-inset-top,0px))] pb-[max(1rem,env(safe-area-inset-bottom,0px))] shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-brand-cyan" />
                <span className="font-bold text-sm text-white">Chat History</span>
              </div>
              <button
                onClick={() => setMobileHistoryOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => {
                handleNewChat();
                setMobileHistoryOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl btn-neon-primary text-xs mb-3 font-semibold touch-press"
            >
              <Plus className="w-4 h-4" />
              <span>New Chat Session</span>
            </button>

            <div className="text-[10px] font-mono text-slate-500 uppercase px-1 mb-1.5">Saved Sessions ({conversations.length})</div>
            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
              {conversations.length === 0 ? (
                <div className="text-center text-xs text-slate-500 py-6">No saved chats yet</div>
              ) : (
                conversations.map((c) => {
                  const active = c._id === currentConversationId || c.id === currentConversationId;
                  return (
                    <button
                      key={c._id || c.id}
                      onClick={() => {
                        loadConversation(c._id || c.id);
                        setMobileHistoryOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between group transition-colors ${
                        active ? 'bg-brand-cyan/15 text-brand-cyan font-bold border border-brand-cyan/40' : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <span className="truncate pr-2">{c.title || 'Untitled Chat'}</span>
                      <span className="text-[9px] font-mono opacity-60 uppercase shrink-0">{c.model?.split('-')[0] || 'AI'}</span>
                    </button>
                  );
                })
              )}
            </div>

            <div className="pt-3 mt-auto border-t border-white/10">
              <div className="p-2.5 rounded-2xl bg-dark-900/90 border border-white/10 text-center">
                <div className="flex items-center justify-between text-[10px] font-mono text-brand-cyan uppercase mb-1">
                  <span>Neural Core</span>
                  <span className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-brand-neonPink animate-ping' : 'bg-emerald-400'}`} />
                </div>
                <AICore3D isGenerating={isStreaming} className="h-16 w-full" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Chat Bar: Mobile Toggles, Model Selector & Multi-format Export */}
        <div className="px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 border-b border-white/10 glass-panel flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 z-20">
          <div className="flex items-center gap-1.5">
            {/* Mobile History Drawer Toggle */}
            <button
              onClick={() => setMobileHistoryOpen(true)}
              className="md:hidden p-1.5 sm:p-2 rounded-xl bg-dark-900 border border-white/10 text-slate-300 hover:text-white flex items-center gap-1 touch-press"
              title="Chat History"
            >
              <History className="w-4 h-4 text-brand-cyan" />
              <span className="text-xs font-medium hidden xs:inline">History</span>
            </button>

            {/* Mobile Quick New Chat Button */}
            <button
              onClick={handleNewChat}
              className="md:hidden p-1.5 sm:p-2 rounded-xl bg-brand-cyan/15 border border-brand-cyan/30 text-brand-cyan hover:bg-brand-cyan/25 touch-press"
              title="New Chat Session"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Model Selector */}
            <div className="relative">
              <button
                onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                className="flex items-center gap-1.5 sm:gap-2.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-dark-900/90 border border-white/10 hover:border-brand-cyan/40 text-xs text-white transition-all shadow-md touch-press"
              >
                <Cpu className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-cyan shrink-0" />
                <span className="font-semibold text-xs truncate max-w-[100px] sm:max-w-none">
                  {AVAILABLE_MODELS.find((m) => m.id === selectedModel)?.name}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono hidden sm:inline">
                  {AVAILABLE_MODELS.find((m) => m.id === selectedModel)?.provider}
                </span>
                <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 shrink-0" />
              </button>

              {/* Dropdown Menu */}
              {modelDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 p-2 rounded-2xl glass-panel bg-dark-900/95 border border-white/15 shadow-2xl z-50">
                  <div className="text-[10px] font-mono text-slate-400 px-2 py-1 uppercase">Switch AI Foundation Model</div>
                  {AVAILABLE_MODELS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setSelectedModel(m.id);
                        setModelDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between transition-colors ${
                        selectedModel === m.id ? 'bg-white/10 text-brand-cyan border border-brand-cyan/30' : 'hover:bg-white/5 text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold">{m.name}</div>
                        <div className="text-[10px] text-slate-400">{m.badge}</div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">{m.provider}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Export Dropdown in All Formats */}
            <div className="relative">
              <button
                onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl glass-btn text-xs font-medium text-slate-300 hover:text-white touch-press"
              >
                <Download className="w-3.5 h-3.5 text-brand-cyan" />
                <span className="hidden sm:inline">Export Chat</span>
                <span className="sm:hidden">Export</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {exportDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 p-2 rounded-2xl glass-panel bg-dark-900/95 border border-white/15 shadow-2xl z-50">
                  <div className="text-[10px] font-mono text-slate-400 px-2 py-1 uppercase">Select Download Format</div>
                  <button
                    onClick={() => handleExport('pdf')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2 hover:bg-white/5 text-slate-200"
                  >
                    <FileText className="w-3.5 h-3.5 text-rose-400" />
                    <span>Download as PDF</span>
                  </button>
                  <button
                    onClick={() => handleExport('md')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2 hover:bg-white/5 text-slate-200"
                  >
                    <FileCode className="w-3.5 h-3.5 text-brand-cyan" />
                    <span>Download as Markdown (.md)</span>
                  </button>
                  <button
                    onClick={() => handleExport('txt')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2 hover:bg-white/5 text-slate-200"
                  >
                    <File className="w-3.5 h-3.5 text-amber-400" />
                    <span>Download as Plain Text (.txt)</span>
                  </button>
                  <button
                    onClick={() => handleExport('json')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2 hover:bg-white/5 text-slate-200"
                  >
                    <Layers className="w-3.5 h-3.5 text-purple-400" />
                    <span>Download as JSON (.json)</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowCostarModal(true)}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 text-xs font-medium transition-colors touch-press"
            >
              <Wand2 className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">CO-STAR Architect</span>
              <span className="sm:hidden">CO-STAR</span>
            </button>
          </div>
        </div>

        {/* Dedicated File Upload Section on Main Page */}
        <div className="px-3 sm:px-4 lg:px-6 py-2 bg-dark-900/70 border-b border-white/10 backdrop-blur-md">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1 sm:p-1.5 rounded-lg bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan shrink-0">
                <FolderUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-xs font-bold text-white truncate">Knowledge Hub</span>
                  <span className="text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan font-mono shrink-0">
                    {attachments.length} {attachments.length === 1 ? 'file' : 'files'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 hidden md:block">
                  Ground AI reasoning with your knowledge files
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-brand-cyan/15 hover:bg-brand-cyan/25 border border-brand-cyan/40 text-brand-cyan hover:text-white text-xs font-medium transition-colors shadow-sm touch-press"
              >
                <Upload className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Upload<span className="hidden xs:inline"> Files</span></span>
              </button>
              <button
                type="button"
                onClick={() => setShowUploadSection(!showUploadSection)}
                className="p-1 sm:p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 transition-colors touch-press"
                title={showUploadSection ? 'Minimize Upload Section' : 'Expand Upload Section'}
              >
                {showUploadSection ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Expandable Dropzone and Uploaded Files Grid */}
          {showUploadSection && (
            <div className="mt-3 space-y-2.5">
              {/* Interactive Drag & Drop Box */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingFile(true);
                }}
                onDragLeave={() => setIsDraggingFile(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingFile(false);
                  if (e.dataTransfer.files?.length) {
                    handleFileUpload({ target: { files: e.dataTransfer.files } });
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`p-3.5 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1 ${
                  isDraggingFile
                    ? 'border-brand-cyan bg-brand-cyan/10 scale-[1.01]'
                    : 'border-white/15 bg-white/[0.02] hover:border-brand-cyan/40 hover:bg-white/[0.04]'
                }`}
              >
                {isUploading ? (
                  <div className="flex items-center gap-2 text-brand-cyan text-xs font-medium py-1">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading & extracting document content for AI knowledge...</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-xs text-slate-200">
                      <Upload className="w-4 h-4 text-brand-cyan" />
                      <span className="font-semibold">Click to upload or drag files directly here</span>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] text-slate-400 font-mono">
                      <span className="px-1.5 py-0.5 rounded bg-white/5 text-rose-300">PDF</span>
                      <span className="px-1.5 py-0.5 rounded bg-white/5 text-brand-cyan">JPEG / PNG / WEBP</span>
                      <span className="px-1.5 py-0.5 rounded bg-white/5 text-amber-300">MP3 / Audio</span>
                      <span className="px-1.5 py-0.5 rounded bg-white/5 text-brand-neonPink">MP4 / WebM</span>
                      <span className="px-1.5 py-0.5 rounded bg-white/5 text-emerald-300">CSV / JSON / DOCX</span>
                      <span>(Up to 25MB)</span>
                    </div>
                  </>
                )}
              </div>

              {/* Uploaded File Cards Grid */}
              {attachments.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                  {attachments.map((att, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-dark-950/80 border border-white/10 flex items-center justify-between gap-2 text-xs hover:border-brand-cyan/30 transition-all"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="p-1.5 rounded-lg bg-white/5 shrink-0">
                          {getAttachmentIcon(att.mimeType)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-white truncate max-w-[130px] text-xs">{att.name}</p>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                            <span>{formatFileSize(att.size)}</span>
                            <span>•</span>
                            <span className="text-emerald-400">Context Ready</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {att.url && (
                          <a
                            href={att.url}
                            download={att.name}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 text-slate-400 hover:text-brand-cyan hover:bg-white/5 rounded-md"
                            title="Download original file"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                          className="p-1 text-slate-400 hover:text-rose-400 hover:bg-white/5 rounded-md"
                          title="Remove file"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                    isUser
                      ? 'bg-gradient-to-tr from-brand-cyan to-brand-blue text-dark-950 font-bold'
                      : 'bg-dark-900 border border-white/10 text-brand-cyan'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-brand-cyan" />}
                </div>

                {/* Bubble */}
                <div
                  className={`relative group p-4 rounded-2xl text-xs leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-r from-brand-cyan/20 to-brand-blue/20 border border-brand-cyan/30 text-white rounded-tr-none'
                      : 'glass-panel bg-dark-900/80 text-slate-200 rounded-tl-none border-white/10'
                  }`}
                >
                  {/* Attachments if any */}
                  {msg.attachments?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2 pb-2 border-b border-white/10">
                      {msg.attachments.map((att, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-brand-cyan group/att">
                          {getAttachmentIcon(att.mimeType)}
                          <span className="max-w-[140px] truncate">{att.name}</span>
                          {att.url && (
                            <a
                              href={att.url}
                              download={att.name}
                              target="_blank"
                              rel="noreferrer"
                              title={`Download ${att.name}`}
                              className="ml-1 text-slate-400 hover:text-white p-0.5 rounded transition-colors"
                            >
                              <Download className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Message content markdown */}
                  <div className="prose prose-invert prose-xs max-w-none prose-pre:bg-dark-950 prose-pre:border prose-pre:border-white/10 prose-code:text-brand-cyan">
                    <ReactMarkdown>{msg.content || (isStreaming ? '...' : '')}</ReactMarkdown>
                  </div>

                  {/* Copy button */}
                  {!isUser && msg.content && (
                    <button
                      onClick={() => copyMessage(msg.content, msg.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 bg-dark-800 text-slate-400 hover:text-white transition-opacity"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 glass-panel border-t border-white/10 bg-dark-950/90 z-20">
          <div className="max-w-4xl mx-auto">
            {/* Attachment preview pills */}
            {attachments.length > 0 && (
              <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-1">
                {attachments.map((att, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-3 py-1 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-xs">
                    {getAttachmentIcon(att.mimeType)}
                    <span className="truncate max-w-[160px]">{att.name}</span>
                    <button
                      onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-rose-400 font-bold ml-1"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleSend} className="relative flex items-center">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                multiple
                className="hidden"
                accept="*/*,.pdf,.docx,.txt,.csv,.json,.png,.jpg,.jpeg,.webp,.mp3,.wav,.mp4,.webm"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Attach Document, Image, Audio, or Video (Any format)"
                className="absolute left-2.5 sm:left-3 p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-brand-cyan hover:bg-white/5 transition-colors touch-press"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                rows={1}
                placeholder={`Message ${AVAILABLE_MODELS.find((m) => m.id === selectedModel)?.name}...`}
                className="w-full pl-10 sm:pl-12 pr-12 sm:pr-14 py-2.5 sm:py-3.5 rounded-2xl glass-input text-base sm:text-xs text-white placeholder-slate-500 resize-none max-h-32"
              />

              <button
                type="submit"
                disabled={!input.trim() || isStreaming}
                className="absolute right-2 sm:right-2.5 p-2 sm:p-2.5 rounded-xl btn-neon-primary disabled:opacity-40 transition-transform active:scale-95 touch-press"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* CO-STAR Prompt Architect Modal */}
      {showCostarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-4">
          <div className="max-w-xl w-full glass-panel bg-dark-900 border border-purple-500/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-brand-purple" />
                <h3 className="text-sm sm:text-base font-bold text-white">CO-STAR Prompt Architect</h3>
              </div>
              <button
                onClick={() => setShowCostarModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs overflow-y-auto pr-1 flex-1">
              <div>
                <label className="font-bold text-brand-cyan mb-1 block">Context (C)</label>
                <input
                  type="text"
                  value={costar.context}
                  onChange={(e) => setCostar({ ...costar, context: e.target.value })}
                  placeholder="e.g. I am building a full-stack SaaS with React and Node.js..."
                  className="w-full p-2.5 rounded-xl glass-input text-base sm:text-xs text-white"
                />
              </div>

              <div>
                <label className="font-bold text-brand-cyan mb-1 block">Objective (O)</label>
                <input
                  type="text"
                  value={costar.objective}
                  onChange={(e) => setCostar({ ...costar, objective: e.target.value })}
                  placeholder="e.g. Architect an enterprise rate limiter middleware..."
                  className="w-full p-2.5 rounded-xl glass-input text-base sm:text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 mb-1 block">Style (S)</label>
                  <input
                    type="text"
                    value={costar.style}
                    onChange={(e) => setCostar({ ...costar, style: e.target.value })}
                    className="w-full p-2 rounded-xl glass-input text-base sm:text-xs text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 mb-1 block">Tone (T)</label>
                  <input
                    type="text"
                    value={costar.tone}
                    onChange={(e) => setCostar({ ...costar, tone: e.target.value })}
                    className="w-full p-2 rounded-xl glass-input text-base sm:text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 mb-1 block">Audience (A)</label>
                  <input
                    type="text"
                    value={costar.audience}
                    onChange={(e) => setCostar({ ...costar, audience: e.target.value })}
                    className="w-full p-2 rounded-xl glass-input text-base sm:text-xs text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 mb-1 block">Response Format (R)</label>
                  <input
                    type="text"
                    value={costar.responseFormat}
                    onChange={(e) => setCostar({ ...costar, responseFormat: e.target.value })}
                    className="w-full p-2 rounded-xl glass-input text-base sm:text-xs text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-white/10 shrink-0">
              <button
                onClick={() => setShowCostarModal(false)}
                className="px-3.5 py-2 rounded-xl text-slate-400 hover:bg-white/5 text-xs touch-press"
              >
                Cancel
              </button>
              <button
                onClick={applyCostarPrompt}
                className="px-4 py-2 rounded-xl btn-neon-purple text-xs font-semibold touch-press"
              >
                Inject into Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
