import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { memoryStore } from '../services/store/memoryStore.js';
import { aiService } from '../services/ai/AIService.js';
export const getConversations = async (req, res, next) => {
    try {
        const userId = req.userId || 'demo-user-1';
        if (memoryStore.isMongoAvailable) {
            const conversations = await Conversation.find({ userId, archived: false })
                .sort({ isPinned: -1, updatedAt: -1 })
                .limit(50);
            res.json({ success: true, data: conversations });
            return;
        }
        // In-memory fallback
        const list = Array.from(memoryStore.conversations.values())
            .filter((c) => c.userId === userId && !c.archived)
            .sort((a, b) => (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0));
        res.json({ success: true, data: list });
    }
    catch (error) {
        next(error);
    }
};
export const getConversationById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.userId || 'demo-user-1';
        if (memoryStore.isMongoAvailable) {
            const conversation = await Conversation.findOne({ _id: id, userId });
            if (!conversation) {
                res.status(404).json({ success: false, message: 'Conversation not found' });
                return;
            }
            const messages = await Message.find({ conversationId: id }).sort({ createdAt: 1 });
            res.json({ success: true, data: { conversation, messages } });
            return;
        }
        // In-memory fallback
        const conversation = memoryStore.conversations.get(id);
        if (!conversation) {
            res.status(404).json({ success: false, message: 'Conversation not found' });
            return;
        }
        const messages = Array.from(memoryStore.messages.values())
            .filter((m) => m.conversationId === id)
            .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
        res.json({ success: true, data: { conversation, messages } });
    }
    catch (error) {
        next(error);
    }
};
export const createConversation = async (req, res, next) => {
    try {
        const userId = req.userId || 'demo-user-1';
        const { title, provider, model, systemPrompt } = req.body;
        const resolved = aiService.resolveProviderAndModel(provider, model);
        if (memoryStore.isMongoAvailable) {
            const conversation = await Conversation.create({
                userId,
                title: title || 'New Conversation',
                provider: resolved.provider,
                model: resolved.model,
                systemPrompt: systemPrompt || undefined,
            });
            res.status(201).json({ success: true, data: conversation });
            return;
        }
        // In-memory fallback
        const id = 'conv-' + Date.now();
        const newConv = {
            _id: id,
            userId,
            title: title || 'New Conversation',
            provider: resolved.provider,
            model: resolved.model,
            systemPrompt,
            isPinned: false,
            archived: false,
            messageCount: 0,
            totalTokens: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        memoryStore.conversations.set(id, newConv);
        res.status(201).json({ success: true, data: newConv });
    }
    catch (error) {
        next(error);
    }
};
export const updateConversation = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.userId || 'demo-user-1';
        const { title, provider, model, systemPrompt, isPinned, archived } = req.body;
        if (memoryStore.isMongoAvailable) {
            const conversation = await Conversation.findOneAndUpdate({ _id: id, userId }, {
                ...(title !== undefined && { title }),
                ...(provider !== undefined && { provider }),
                ...(model !== undefined && { model }),
                ...(systemPrompt !== undefined && { systemPrompt }),
                ...(isPinned !== undefined && { isPinned }),
                ...(archived !== undefined && { archived }),
            }, { new: true });
            if (!conversation) {
                res.status(404).json({ success: false, message: 'Conversation not found' });
                return;
            }
            res.json({ success: true, data: conversation });
            return;
        }
        // In-memory fallback
        const conv = memoryStore.conversations.get(id);
        if (!conv) {
            res.status(404).json({ success: false, message: 'Conversation not found' });
            return;
        }
        if (title !== undefined)
            conv.title = title;
        if (provider !== undefined)
            conv.provider = provider;
        if (model !== undefined)
            conv.model = model;
        if (systemPrompt !== undefined)
            conv.systemPrompt = systemPrompt;
        if (isPinned !== undefined)
            conv.isPinned = isPinned;
        if (archived !== undefined)
            conv.archived = archived;
        conv.updatedAt = new Date();
        memoryStore.conversations.set(id, conv);
        res.json({ success: true, data: conv });
    }
    catch (error) {
        next(error);
    }
};
export const deleteConversation = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.userId || 'demo-user-1';
        if (memoryStore.isMongoAvailable) {
            await Conversation.findOneAndDelete({ _id: id, userId });
            await Message.deleteMany({ conversationId: id });
            res.json({ success: true, message: 'Conversation deleted successfully' });
            return;
        }
        // In-memory fallback
        memoryStore.conversations.delete(id);
        for (const [msgId, msg] of memoryStore.messages) {
            if (msg.conversationId === id) {
                memoryStore.messages.delete(msgId);
            }
        }
        res.json({ success: true, message: 'Conversation deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
