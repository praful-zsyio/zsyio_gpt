import { mediaService } from '../services/media/MediaService.js';
import { Media } from '../models/Media.js';
import { User } from '../models/User.js';
import { memoryStore } from '../services/store/memoryStore.js';
export const generateImage = async (req, res, next) => {
    try {
        const userId = req.userId || 'demo-user-1';
        const { prompt, size, style, aspectRatio, model } = req.body;
        if (!prompt || !prompt.trim()) {
            res.status(400).json({ success: false, message: 'Prompt is required' });
            return;
        }
        const creditsCost = 20; // 20 credits per generation
        const result = await mediaService.generateImage(prompt, { size, style, aspectRatio, model });
        let mediaRecord;
        if (memoryStore.isMongoAvailable) {
            mediaRecord = await Media.create({
                userId,
                type: 'image',
                prompt,
                url: result.url,
                provider: result.provider,
                model: result.model,
                aspectRatio: aspectRatio || '1:1',
                style: style || 'vivid',
                creditsDeducted: creditsCost,
            });
            await User.findByIdAndUpdate(userId, { $inc: { credits: -creditsCost } });
        }
        else {
            const id = 'media-' + Date.now();
            const memMedia = {
                _id: id,
                userId,
                type: 'image',
                prompt,
                url: result.url,
                provider: result.provider,
                model: result.model,
                aspectRatio: aspectRatio || '1:1',
                style: style || 'vivid',
                creditsDeducted: creditsCost,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            memoryStore.medias.set(id, memMedia);
            mediaRecord = memMedia;
            const user = memoryStore.users.get(userId);
            if (user)
                user.credits = Math.max(0, user.credits - creditsCost);
        }
        res.status(201).json({
            success: true,
            message: 'Image generated successfully',
            data: mediaRecord,
        });
    }
    catch (error) {
        next(error);
    }
};
export const generateTTS = async (req, res, next) => {
    try {
        const userId = req.userId || 'demo-user-1';
        const { text, voice, speed, model } = req.body;
        if (!text || !text.trim()) {
            res.status(400).json({ success: false, message: 'Text is required for TTS synthesis' });
            return;
        }
        const creditsCost = 10;
        const result = await mediaService.generateTTS(text, { voice, speed, model });
        let mediaRecord;
        if (memoryStore.isMongoAvailable) {
            mediaRecord = await Media.create({
                userId,
                type: 'audio',
                prompt: text,
                url: result.url,
                provider: result.provider,
                model: result.model,
                voice: voice || 'alloy',
                creditsDeducted: creditsCost,
            });
            await User.findByIdAndUpdate(userId, { $inc: { credits: -creditsCost } });
        }
        else {
            const id = 'media-' + Date.now();
            const memMedia = {
                _id: id,
                userId,
                type: 'audio',
                prompt: text,
                url: result.url,
                provider: result.provider,
                model: result.model,
                voice: voice || 'alloy',
                creditsDeducted: creditsCost,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            memoryStore.medias.set(id, memMedia);
            mediaRecord = memMedia;
            const user = memoryStore.users.get(userId);
            if (user)
                user.credits = Math.max(0, user.credits - creditsCost);
        }
        res.status(201).json({
            success: true,
            message: 'Audio synthesized successfully',
            data: mediaRecord,
        });
    }
    catch (error) {
        next(error);
    }
};
export const generateVideo = async (req, res, next) => {
    try {
        const userId = req.userId || 'demo-user-1';
        const { prompt, aspectRatio, duration, motion } = req.body;
        if (!prompt || !prompt.trim()) {
            res.status(400).json({ success: false, message: 'Video prompt is required' });
            return;
        }
        const creditsCost = 50;
        const result = await mediaService.generateVideo(prompt, { aspectRatio, duration, motion });
        let mediaRecord;
        if (memoryStore.isMongoAvailable) {
            mediaRecord = await Media.create({
                userId,
                type: 'video',
                prompt,
                url: result.url,
                provider: result.provider,
                model: result.model,
                aspectRatio: aspectRatio || '16:9',
                duration: duration || 5,
                creditsDeducted: creditsCost,
            });
            await User.findByIdAndUpdate(userId, { $inc: { credits: -creditsCost } });
        }
        else {
            const id = 'media-' + Date.now();
            const memMedia = {
                _id: id,
                userId,
                type: 'video',
                prompt,
                url: result.url,
                provider: result.provider,
                model: result.model,
                aspectRatio: aspectRatio || '16:9',
                duration: duration || 5,
                creditsDeducted: creditsCost,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            memoryStore.medias.set(id, memMedia);
            mediaRecord = memMedia;
            const user = memoryStore.users.get(userId);
            if (user)
                user.credits = Math.max(0, user.credits - creditsCost);
        }
        res.status(201).json({
            success: true,
            message: 'Video generated successfully',
            data: mediaRecord,
        });
    }
    catch (error) {
        next(error);
    }
};
export const getMediaHistory = async (req, res, next) => {
    try {
        const userId = req.userId || 'demo-user-1';
        const { type } = req.query;
        if (memoryStore.isMongoAvailable) {
            const query = { userId };
            if (type && ['image', 'audio', 'video'].includes(type)) {
                query.type = type;
            }
            const history = await Media.find(query).sort({ createdAt: -1 }).limit(50);
            res.json({ success: true, data: history });
            return;
        }
        const list = Array.from(memoryStore.medias.values())
            .filter((m) => m.userId === userId && (!type || m.type === type))
            .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
        res.json({ success: true, data: list });
    }
    catch (error) {
        next(error);
    }
};
