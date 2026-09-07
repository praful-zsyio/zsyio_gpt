import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Sparkles,
  User,
  Copy,
  Check,
  Volume2,
  ChevronDown,
  Cpu,
  Zap,
  Terminal,
  Code2,
  Lightbulb,
  Trash2,
  Paperclip,
  X,
  FileText,
  Image as ImageIcon,
  Download,
  FileCode,
  History,
} from 'lucide-react';
import { streamChatMessage, createNewConversation, generateMediaTTS, uploadWorkspaceFile } from '../../api';
import BrandLogo from '../common/BrandLogo';
import ChatHistoryDrawer from './ChatHistoryDrawer';
import confetti from 'canvas-confetti';

const INITIAL_WELCOME = {
  id: 'welcome',
  role: 'assistant',
  content: "👋 Welcome to **ZsyioGPT Unified AI Gateway**! I'm wired directly to your high-performance multi-model backend. You can query GPT-4o, Claude 3.5 Sonnet, Gemini 1.5, or Grok with real-time streaming, and upload files or documents for instant context.",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

const QUICK_PROMPTS = [
  { icon: Code2, label: 'Full-Stack Architecture', prompt: 'Design a high-scale microservices architecture for real-time generative AI applications.' },
  { icon: Terminal, label: 'Three.js Shader Animation', prompt: 'Write an interactive Three.js GLSL fragment shader for a floating cyber holographic grid.' },
  { icon: Lightbulb, label: 'Growth Strategies', prompt: 'What are the top 5 product growth loops for modern SaaS developer tools?' },
  { icon: Zap, label: 'Optimize Node.js Event Loop', prompt: 'How to diagnose and fix event loop lag in Node.js with high concurrency I/O?' },
];

export default function ChatCockpit({ models, selectedModel, setSelectedModel, theme }) {
  const [messages, setMessages] = useState([INITIAL_WELCOME]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [audioPlayingId, setAudioPlayingId] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // File Upload State
  const fileInputRef = useRef(null);
  const [attachedFile, setAttachedFile] = useState(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  // Sync when chat history or app data is wiped
  useEffect(() => {
    const handleClear = () => {
      setMessages([INITIAL_WELCOME]);
      setConversationId(null);
    };
    window.addEventListener('zsyiogpt_chat_history_cleared', handleClear);
    return () => window.removeEventListener('zsyiogpt_chat_history_cleared', handleClear);
  }, []);

  // Handle file selection and upload
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFile(true);
    try {
      const res = await uploadWorkspaceFile(file);
      const uploadedData = res?.data || res;
      setAttachedFile({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        mimeType: file.type,
        url: uploadedData?.url || URL.createObjectURL(file),
      });
    } catch (err) {
      console.warn('File upload fallback:', err);
      // Local fallback
      setAttachedFile({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        mimeType: file.type,
        url: URL.createObjectURL(file),
      });
    } finally {
      setIsUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Clear / Delete All Chat
  const handleClearAllChat = () => {
    setMessages([
      {
        ...INITIAL_WELCOME,
        id: 'welcome_' + Date.now(),
        content: "🧹 Chat history cleared. Ready for a brand new conversation!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setConversationId(null);
    setAttachedFile(null);
    setShowClearConfirm(false);
  };

  // Send message handler
  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if ((!query && !attachedFile) || isStreaming) return;

    setInput('');
    const currentAttachedFile = attachedFile;
    setAttachedFile(null);

    // Ensure conversation exists
    let convId = conversationId;
    if (!convId) {
      try {
        const conv = await createNewConversation(query.slice(0, 30) || 'File Analysis', selectedModel);
        if (conv?._id) {
          convId = conv._id;
          setConversationId(convId);
        }
      } catch (err) {
        console.warn('Conversation init fallback:', err);
      }
    }

    const userMessage = {
      id: 'user_' + Date.now(),
      role: 'user',
      content: query,
      file: currentAttachedFile,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const assistantPlaceholderId = 'asst_' + Date.now();
    const assistantMessage = {
      id: assistantPlaceholderId,
      role: 'assistant',
      content: '',
      model: selectedModel,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setIsStreaming(true);

    let accumulatedContent = '';
    const fullQuery = currentAttachedFile
      ? `[User attached file: ${currentAttachedFile.name} (${currentAttachedFile.size})]\n\n${query || 'Please analyze the attached file.'}`
      : query;

    await streamChatMessage({
      conversationId: convId || 'temp_conv',
      content: fullQuery,
      model: selectedModel,
      onChunk: (chunk) => {
        accumulatedContent += chunk;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantPlaceholderId
              ? { ...msg, content: accumulatedContent }
              : msg
          )
        );
      },
      onDone: () => {
        setIsStreaming(false);
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === assistantPlaceholderId && !msg.content.trim()) {
              return {
                ...msg,
                content: `⚡ **Connected to ZsyioGPT Gateway**\n\nYour request was processed through the \`${selectedModel}\` pipeline. *(Note: Ensure you configure your API keys in \`server/.env\` for live multi-provider tokens, or enjoy local mock responses).*`,
              };
            }
            return msg;
          })
        );
      },
      onError: (err) => {
        setIsStreaming(false);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantPlaceholderId
              ? {
                  ...msg,
                  content: `⚠️ **Gateway Response**\n\nConnected to server! The AI model \`${selectedModel}\` responded: Please check \`server/.env\` to ensure your \`OPENAI_API_KEY\` or \`GOOGLE_AI_API_KEY\` is active.\n\n*Server Log Error: ${err.message}*`,
                }
              : msg
          )
        );
      },
    });
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePlayTTS = async (id, text) => {
    try {
      setAudioPlayingId(id);
      const cleanText = text.replace(/[*_#`]/g, '').slice(0, 200);
      const res = await generateMediaTTS({ text: cleanText });
      if (res?.data?.audioUrl) {
        const audio = new Audio(res.data.audioUrl);
        audio.play();
        audio.onended = () => setAudioPlayingId(null);
      } else {
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 1.05;
        utterance.onend = () => setAudioPlayingId(null);
        speechSynthesis.speak(utterance);
      }
    } catch {
      setAudioPlayingId(null);
    }
  };

  const currentModelObj = models?.find((m) => m.id === selectedModel) || {
    id: selectedModel,
    displayName: selectedModel,
    provider: 'openai',
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto px-3 sm:px-6 pt-24 pb-8 w-full relative z-10">
      {/* Top Cockpit Header: Brand Logo, Model Switcher & Delete All Chat */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2 relative">
          {/* Logo at Top Section of Chat */}
          <BrandLogo size="md" className="mr-1" />

          <button
            onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl glass-panel text-adaptive transition-all shadow-md text-sm border border-white/15"
          >
            <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            <span className="font-semibold">{currentModelObj.displayName || selectedModel}</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-400 uppercase font-bold">
              {currentModelObj.provider}
            </span>
            <ChevronDown className="w-4 h-4 text-adaptive-muted transition-transform duration-200" />
          </button>

          {/* Chat History Drawer Toggle Button */}
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass-panel text-adaptive-muted hover:text-sky-400 hover:border-sky-400/40 transition-all text-xs font-semibold shadow-md"
            title="Open Chat History"
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">History</span>
          </button>

          {/* Delete All Chat Button */}
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass-panel text-red-400 hover:text-red-300 hover:border-red-400/40 transition-all text-xs font-semibold shadow-md"
            title="Delete All Chat History"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear Chat</span>
          </button>

          {/* Clear Confirm Popover */}
          <AnimatePresence>
            {showClearConfirm && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 5 }}
                className="absolute left-40 top-full mt-2 p-3.5 rounded-2xl glass-panel border border-red-500/40 shadow-2xl z-50 text-xs text-adaptive w-60 space-y-2"
              >
                <div className="font-bold text-red-400">Delete all messages?</div>
                <p className="text-[11px] text-adaptive-muted leading-relaxed">
                  This will wipe all active chat logs in this conversation.
                </p>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-2.5 py-1 rounded-lg text-adaptive-muted hover:text-adaptive text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleClearAllChat}
                    className="px-3 py-1 rounded-lg bg-red-500 text-white font-bold text-xs shadow-md hover:bg-red-600 transition-colors"
                  >
                    Yes, Delete
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Model Selector Dropdown */}
          <AnimatePresence>
            {modelDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute left-10 top-full mt-2 w-72 p-2 rounded-2xl glass-panel border border-white/20 shadow-2xl z-50 backdrop-blur-2xl"
              >
                <div className="text-[11px] font-mono uppercase tracking-wider text-adaptive-muted px-3 py-1.5 border-b border-white/10">
                  Select Active Intelligence Model
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1 mt-1">
                  {(models.length > 0 ? models : [
                    { id: 'gpt-4o', displayName: 'GPT-4o Omnimodel', provider: 'openai' },
                    { id: 'claude-3-5-sonnet-20241022', displayName: 'Claude 3.5 Sonnet', provider: 'anthropic' },
                    { id: 'gemini-1.5-pro', displayName: 'Gemini 1.5 Pro', provider: 'gemini' },
                    { id: 'grok-beta', displayName: 'Grok Beta', provider: 'xai' },
                  ]).map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setSelectedModel(m.id);
                        setModelDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                        selectedModel === m.id
                          ? 'bg-sky-500/20 text-sky-400 border border-sky-400/40 font-bold'
                          : 'hover:bg-white/10 text-adaptive'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold">{m.displayName || m.id}</div>
                        <div className="text-[10px] text-adaptive-muted uppercase font-mono">{m.provider}</div>
                      </div>
                      {selectedModel === m.id && <Check className="w-4 h-4 text-sky-400" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Telemetry Badges */}
        <div className="flex items-center gap-2 text-xs font-mono text-adaptive-muted">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg glass-panel text-sky-400 border border-white/10">
            <Cpu className="w-3.5 h-3.5" />
            <span>SSE Stream</span>
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg glass-panel text-amber-400 border border-white/10">
            <Zap className="w-3.5 h-3.5" />
            <span>Low Latency</span>
          </span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 sm:pr-2 min-h-[380px]">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {/* Logo at Every Assistant Message Section */}
              {!isUser && (
                <div className="mt-1 flex-shrink-0">
                  <BrandLogo size="md" />
                </div>
              )}

              <div
                className={`relative max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-sm leading-relaxed transition-all ${
                  isUser
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/15'
                    : 'glass-panel text-adaptive shadow-xl border border-white/15'
                }`}
              >
                {/* Header Info with Model badge */}
                <div className="flex items-center justify-between gap-3 text-[11px] mb-1.5 opacity-70 select-none">
                  <span className="font-semibold flex items-center gap-1">
                    {isUser ? 'You' : (
                      <>
                        <span>ZsyioGPT</span>
                        <span className="text-sky-400 font-mono">({msg.model || selectedModel})</span>
                      </>
                    )}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Attached File in Message Bubble (if any) */}
                {msg.file && (
                  <div className="mb-3 p-2.5 rounded-xl bg-black/20 border border-white/15 flex items-center gap-3 text-xs">
                    {msg.file.mimeType?.startsWith('image/') ? (
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/20 bg-black/40 flex-shrink-0">
                        <img src={msg.file.url} alt={msg.file.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="p-2 rounded-lg bg-sky-500/20 text-sky-300">
                        <FileText className="w-5 h-5" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold truncate text-white">{msg.file.name}</div>
                      <div className="text-[10px] opacity-75">{msg.file.size}</div>
                    </div>
                    <a
                      href={msg.file.url}
                      download={msg.file.name}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                      title="Download File"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                {/* Message Body */}
                <div className="whitespace-pre-wrap font-sans text-sm sm:text-base selection:bg-sky-400/40">
                  {msg.content || (
                    <span className="inline-flex items-center gap-1.5 text-sky-400 animate-pulse">
                      <span>Synthesizing intelligence</span>
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                    </span>
                  )}
                </div>

                {/* Assistant Action Bar */}
                {!isUser && msg.content && (
                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/10 text-adaptive-muted">
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="p-1 rounded-md hover:bg-white/10 hover:text-adaptive transition-colors"
                      title="Copy message"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => handlePlayTTS(msg.id, msg.content)}
                      className={`p-1 rounded-md hover:bg-white/10 hover:text-adaptive transition-colors ${
                        audioPlayingId === msg.id ? 'text-sky-400 animate-pulse' : ''
                      }`}
                      title="Listen with Voice Engine"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center flex-shrink-0 shadow-md mt-1">
                  <User className="w-4 h-4 text-sky-400" />
                </div>
              )}
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Pills */}
      {messages.length <= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-3"
        >
          {QUICK_PROMPTS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSend(item.prompt)}
                className="flex items-center gap-3 p-2.5 rounded-xl glass-panel hover:border-sky-400/40 text-left text-xs transition-all group hover:scale-[1.01]"
              >
                <div className="p-1.5 rounded-lg bg-sky-500/15 text-sky-400 transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-adaptive group-hover:text-sky-400 transition-colors">
                    {item.label}
                  </div>
                  <div className="text-[11px] text-adaptive-muted line-clamp-1">{item.prompt}</div>
                </div>
              </button>
            );
          })}
        </motion.div>
      )}

      {/* Attached File Preview Chip Above Input */}
      {attachedFile && (
        <div className="mb-2 p-2 px-3 rounded-xl glass-panel border border-sky-400/40 inline-flex items-center gap-3 text-xs shadow-md">
          {attachedFile.mimeType?.startsWith('image/') ? (
            <ImageIcon className="w-4 h-4 text-sky-400" />
          ) : (
            <FileText className="w-4 h-4 text-sky-400" />
          )}
          <span className="font-bold text-adaptive truncate max-w-[200px]">{attachedFile.name}</span>
          <span className="text-[10px] text-adaptive-muted font-mono">{attachedFile.size}</span>
          <button
            onClick={() => setAttachedFile(null)}
            className="p-1 rounded-md hover:bg-white/10 text-adaptive-muted hover:text-red-400 transition-colors ml-1"
            title="Remove attached file"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Chat Input Cockpit Bar with File Upload Attachment Button */}
      <div className="mt-2 relative">
        <div className="glass-panel p-2 rounded-2xl border border-white/20 focus-within:border-sky-400/60 shadow-2xl transition-all">
          <div className="flex items-end gap-2">
            {/* Upload File Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingFile}
              className="p-2.5 rounded-xl text-adaptive-muted hover:text-sky-400 hover:bg-white/10 transition-all flex-shrink-0"
              title="Upload file, image, PDF, or code for AI analysis"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
            />

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={`Ask ${currentModelObj.displayName || selectedModel} anything or attach a file...`}
              rows={1}
              className="flex-1 bg-transparent text-adaptive placeholder-gray-400 text-sm sm:text-base px-2 py-2 resize-none focus:outline-none max-h-32 min-h-[44px]"
            />

            {/* Logo at Bottom Input Section */}
            <div className="hidden sm:flex items-center pb-2 pr-1 opacity-70">
              <BrandLogo size="sm" />
            </div>

            <button
              onClick={() => handleSend()}
              disabled={(!input.trim() && !attachedFile) || isStreaming}
              className={`p-3 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                (input.trim() || attachedFile) && !isStreaming
                  ? 'bg-gradient-to-r from-sky-400 via-blue-500 to-sky-600 text-white shadow-lg shadow-sky-500/30 hover:scale-105 active:scale-95'
                  : 'bg-white/10 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Chat History Slide-Over Drawer */}
      <ChatHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        activeConversationId={conversationId}
        onSelectConversation={(conv) => {
          setConversationId(conv._id || conv.id);
          if (conv.messages && conv.messages.length > 0) {
            setMessages(conv.messages);
          } else {
            setMessages([
              INITIAL_WELCOME,
              {
                id: 'restored_' + Date.now(),
                role: 'assistant',
                content: `Restored session **${conv.title || 'Conversation'}**. Continuing from previous context.`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
          }
        }}
        onNewChat={handleClearAllChat}
      />
    </div>
  );
}
