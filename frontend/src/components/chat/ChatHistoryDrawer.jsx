import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  X,
  Plus,
  MessageSquare,
  Trash2,
  Search,
  Clock,
  ChevronRight,
  Bot,
  Sparkles,
} from 'lucide-react';
import BrandLogo from '../common/BrandLogo';
import { fetchConversations, createNewConversation } from '../../api';

export default function ChatHistoryDrawer({
  isOpen,
  onClose,
  activeConversationId,
  onSelectConversation,
  onNewChat,
}) {
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchConversations()
        .then((data) => {
          if (data && data.length > 0) {
            setConversations(data);
          } else {
            // Load saved conversations from localStorage if available
            const saved = localStorage.getItem('zsyiogpt_local_conversations');
            if (saved) {
              try {
                setConversations(JSON.parse(saved));
              } catch {}
            }
          }
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  useEffect(() => {
    const handleSync = () => {
      const saved = localStorage.getItem('zsyiogpt_local_conversations');
      setConversations(saved ? JSON.parse(saved) : []);
    };
    window.addEventListener('zsyiogpt_chat_history_cleared', handleSync);
    return () => window.removeEventListener('zsyiogpt_chat_history_cleared', handleSync);
  }, []);

  const handleDeleteConversation = (id, e) => {
    e.stopPropagation();
    const filtered = conversations.filter((c) => (c._id || c.id) !== id);
    setConversations(filtered);
    localStorage.setItem('zsyiogpt_local_conversations', JSON.stringify(filtered));
  };

  const handleClearAllHistory = () => {
    if (window.confirm('Are you sure you want to delete all chat history from the app?')) {
      localStorage.removeItem('zsyiogpt_local_conversations');
      setConversations([]);
      window.dispatchEvent(new Event('zsyiogpt_chat_history_cleared'));
      if (onNewChat) onNewChat();
    }
  };

  const filteredConversations = conversations.filter((c) =>
    (c.title || 'Chat Conversation').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-start bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ x: -320, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -320, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="w-full max-w-xs sm:max-w-sm h-full glass-panel-white border-r border-white/20 shadow-2xl flex flex-col p-4 sm:p-5 relative z-10 text-adaptive"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <BrandLogo size="sm" />
            <span className="font-extrabold text-sm tracking-tight text-adaptive">
              Chat History
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-adaptive-muted hover:text-adaptive transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="pt-3">
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-sky-400 via-blue-500 to-sky-600 text-white font-bold text-xs shadow-md shadow-sky-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Start New Conversation</span>
          </button>
        </div>

        {/* Search Filter */}
        <div className="relative my-3">
          <Search className="w-3.5 h-3.5 text-adaptive-muted absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search past chats..."
            className="w-full bg-adaptive-input border rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-sky-400 transition-colors"
          />
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {loading ? (
            <div className="text-center py-8 text-xs text-adaptive-muted">
              Loading chat sessions...
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <MessageSquare className="w-8 h-8 text-sky-400/40 mx-auto" />
              <div className="text-xs font-semibold text-adaptive">No past conversations</div>
              <p className="text-[11px] text-adaptive-muted max-w-[200px] mx-auto">
                Start chatting to save context and restore sessions anytime.
              </p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const convId = conv._id || conv.id;
              const isActive = activeConversationId === convId;
              return (
                <div
                  key={convId}
                  onClick={() => {
                    onSelectConversation(conv);
                    onClose();
                  }}
                  className={`group flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                    isActive
                      ? 'bg-sky-500/20 border-sky-400 text-sky-400 font-bold shadow-sm'
                      : 'border-white/5 hover:border-white/20 glass-panel hover:bg-white/5 text-adaptive'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <MessageSquare className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs truncate font-medium">{conv.title || 'Untitled Session'}</div>
                      <div className="text-[10px] text-adaptive-muted font-mono flex items-center gap-1 mt-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{conv.createdAt ? new Date(conv.createdAt).toLocaleDateString() : 'Recent'}</span>
                        {conv.model && <span>• {conv.model}</span>}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDeleteConversation(convId, e)}
                    className="p-1 rounded-lg hover:bg-red-500/20 hover:text-red-400 text-adaptive-muted opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete conversation"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer Telemetry & Data Clear */}
        <div className="pt-3 border-t border-white/10 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-adaptive-muted">
            <span>{conversations.length} Saved Chats</span>
            <span className="text-sky-400 font-bold">Auto-Synced</span>
          </div>

          {conversations.length > 0 && (
            <button
              onClick={handleClearAllHistory}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 text-xs font-semibold transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All Chat History</span>
            </button>
          )}
        </div>
      </motion.div>

      <div className="flex-1" onClick={onClose} />
    </div>
  );
}
