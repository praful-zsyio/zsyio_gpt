import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { Usage } from '../models/Usage.js';
import { User } from '../models/User.js';
import { aiService } from '../services/ai/AIService.js';
import { memoryStore } from '../services/store/memoryStore.js';
export const streamMessage = async (req, res, next) => {
    try {
        const userId = req.userId || 'demo-user-1';
        const { conversationId, content, provider, model, attachments, systemPrompt } = req.body;
        if (!content || !content.trim()) {
            res.status(400).json({ success: false, message: 'Message content is required' });
            return;
        }
        let activeConvId = conversationId;
        let currentProvider = provider || 'openai';
        let currentModel = model || 'gpt-4o';
        let userMsgId = 'msg-' + Date.now();
        let aiMessages = [];
        if (memoryStore.isMongoAvailable) {
            let conversation;
            if (conversationId) {
                conversation = await Conversation.findOne({ _id: conversationId, userId });
            }
            if (!conversation) {
                conversation = await Conversation.create({
                    userId,
                    title: content.slice(0, 40) + (content.length > 40 ? '...' : ''),
                    provider: currentProvider,
                    model: currentModel,
                });
            }
            activeConvId = conversation._id.toString();
            currentProvider = provider || conversation.provider || 'openai';
            currentModel = model || conversation.model || 'gpt-4o';
            const userMessage = await Message.create({
                conversationId: conversation._id,
                userId,
                role: 'user',
                content,
                attachments: attachments || [],
                provider: currentProvider,
                model: currentModel,
            });
            userMsgId = userMessage._id.toString();
            const pastMessages = await Message.find({ conversationId: conversation._id })
                .sort({ createdAt: 1 })
                .limit(20);
            aiMessages = pastMessages.map((m) => ({
                role: m.role,
                content: m.content,
                attachments: m.attachments,
            }));
        }
        else {
            // In-memory mode
            let conv = conversationId ? memoryStore.conversations.get(conversationId) : undefined;
            if (!conv) {
                activeConvId = 'conv-' + Date.now();
                conv = {
                    _id: activeConvId,
                    userId,
                    title: content.slice(0, 40) + (content.length > 40 ? '...' : ''),
                    provider: currentProvider,
                    model: currentModel,
                    isPinned: false,
                    archived: false,
                    messageCount: 0,
                    totalTokens: 0,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                memoryStore.conversations.set(activeConvId, conv);
            }
            currentProvider = provider || conv.provider || 'openai';
            currentModel = model || conv.model || 'gpt-4o';
            const memUserMsg = {
                _id: userMsgId,
                conversationId: activeConvId,
                userId,
                role: 'user',
                content,
                attachments: attachments || [],
                provider: currentProvider,
                model: currentModel,
                createdAt: new Date(),
            };
            memoryStore.messages.set(userMsgId, memUserMsg);
            const past = Array.from(memoryStore.messages.values())
                .filter((m) => m.conversationId === activeConvId)
                .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
            aiMessages = past.map((m) => ({
                role: m.role,
                content: m.content,
                attachments: m.attachments,
            }));
        }
        // Setup SSE Headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders?.();
        res.write(`event: init\ndata: ${JSON.stringify({ conversationId: activeConvId, userMessageId: userMsgId })}\n\n`);
        let fullAiResponse = '';
        let inputTokens = Math.ceil(content.length / 4);
        let outputTokens = 0;
        const startTime = Date.now();
        try {
            const stream = aiService.streamMessage(currentProvider, currentModel, aiMessages, {
                systemPrompt,
            });
            for await (const chunk of stream) {
                if (chunk.delta) {
                    fullAiResponse += chunk.delta;
                    res.write(`event: delta\ndata: ${JSON.stringify({ delta: chunk.delta })}\n\n`);
                }
                if (chunk.inputTokens)
                    inputTokens = chunk.inputTokens;
                if (chunk.outputTokens)
                    outputTokens = chunk.outputTokens;
            }
        }
        catch (streamError) {
            console.error('[AI Stream Error]', streamError);
            const errorMessage = streamError.message || 'AI generation failed';
            res.write(`event: error\ndata: ${JSON.stringify({ error: errorMessage })}\n\n`);
            res.end();
            return;
        }
        const latencyMs = Date.now() - startTime;
        if (outputTokens === 0) {
            outputTokens = Math.max(1, Math.ceil(fullAiResponse.length / 4));
        }
        const { estimatedCost, credits } = aiService.calculateCost(currentModel, inputTokens, outputTokens);
        let assistantMsgId = 'ai-msg-' + Date.now();
        if (memoryStore.isMongoAvailable) {
            const assistantMessage = await Message.create({
                conversationId: activeConvId,
                userId,
                role: 'assistant',
                content: fullAiResponse,
                provider: currentProvider,
                model: currentModel,
                inputTokens,
                outputTokens,
                generationTimeMs: latencyMs,
            });
            assistantMsgId = assistantMessage._id.toString();
            await Usage.create({
                userId,
                conversationId: activeConvId,
                messageId: assistantMessage._id,
                provider: currentProvider,
                model: currentModel,
                inputTokens,
                outputTokens,
                totalTokens: inputTokens + outputTokens,
                estimatedCost,
                creditsDeducted: credits,
                requestType: 'chat',
                latencyMs,
            });
            if (userId) {
                await User.findByIdAndUpdate(userId, { $inc: { credits: -credits } });
            }
            await Conversation.findByIdAndUpdate(activeConvId, {
                $inc: { messageCount: 2, totalTokens: inputTokens + outputTokens },
                provider: currentProvider,
                model: currentModel,
            });
        }
        else {
            // In-memory save
            const memAiMsg = {
                _id: assistantMsgId,
                conversationId: activeConvId,
                userId,
                role: 'assistant',
                content: fullAiResponse,
                provider: currentProvider,
                model: currentModel,
                inputTokens,
                outputTokens,
                generationTimeMs: latencyMs,
                createdAt: new Date(),
            };
            memoryStore.messages.set(assistantMsgId, memAiMsg);
            memoryStore.usages.unshift({
                _id: 'usage-' + Date.now(),
                userId,
                conversationId: activeConvId,
                messageId: assistantMsgId,
                provider: currentProvider,
                model: currentModel,
                inputTokens,
                outputTokens,
                totalTokens: inputTokens + outputTokens,
                estimatedCost,
                creditsDeducted: credits,
                requestType: 'chat',
                latencyMs,
                createdAt: new Date(),
            });
            const user = memoryStore.users.get(userId);
            if (user) {
                user.credits = Math.max(0, user.credits - credits);
            }
            const conv = memoryStore.conversations.get(activeConvId);
            if (conv) {
                conv.messageCount += 2;
                conv.totalTokens += inputTokens + outputTokens;
                conv.provider = currentProvider;
                conv.model = currentModel;
                conv.updatedAt = new Date();
            }
        }
        res.write(`event: done\ndata: ${JSON.stringify({
            messageId: assistantMsgId,
            content: fullAiResponse,
            inputTokens,
            outputTokens,
            creditsDeducted: credits,
            latencyMs,
        })}\n\n`);
        res.end();
    }
    catch (error) {
        next(error);
    }
};
