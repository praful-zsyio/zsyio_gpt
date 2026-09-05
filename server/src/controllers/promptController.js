import { Prompt } from '../models/Prompt.js';
import { memoryStore } from '../services/store/memoryStore.js';
export const getPrompts = async (req, res, next) => {
    try {
        const userId = req.userId || 'demo-user-1';
        if (memoryStore.isMongoAvailable) {
            const prompts = await Prompt.find({
                $or: [{ userId }, { isPublic: true }],
            }).sort({ isFavorite: -1, usageCount: -1, createdAt: -1 });
            res.json({ success: true, data: prompts });
            return;
        }
        const list = Array.from(memoryStore.prompts.values())
            .filter((p) => p.userId === userId || p.isPublic)
            .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
        res.json({ success: true, data: list });
    }
    catch (error) {
        next(error);
    }
};
export const createPrompt = async (req, res, next) => {
    try {
        const userId = req.userId || 'demo-user-1';
        const { name, category, content, description, variables, costar, isPublic } = req.body;
        if (memoryStore.isMongoAvailable) {
            const prompt = await Prompt.create({
                userId,
                name,
                category: category || 'General',
                content,
                description: description || '',
                variables: variables || [],
                costar: costar || {},
                isPublic: isPublic || false,
            });
            res.status(201).json({ success: true, data: prompt });
            return;
        }
        const id = 'prompt-' + Date.now();
        const newPrompt = {
            _id: id,
            userId,
            name,
            category: category || 'General',
            content,
            description: description || '',
            variables: variables || [],
            costar: costar || {},
            isPublic: isPublic || false,
            isFavorite: false,
            usageCount: 0,
            createdAt: new Date(),
        };
        memoryStore.prompts.set(id, newPrompt);
        res.status(201).json({ success: true, data: newPrompt });
    }
    catch (error) {
        next(error);
    }
};
export const deletePrompt = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.userId || 'demo-user-1';
        if (memoryStore.isMongoAvailable) {
            const prompt = await Prompt.findOneAndDelete({ _id: id, userId });
            if (!prompt) {
                res.status(404).json({ success: false, message: 'Prompt not found or unauthorized' });
                return;
            }
            res.json({ success: true, message: 'Prompt deleted successfully' });
            return;
        }
        const prompt = memoryStore.prompts.get(id);
        if (!prompt || prompt.userId !== userId) {
            res.status(404).json({ success: false, message: 'Prompt not found or unauthorized' });
            return;
        }
        memoryStore.prompts.delete(id);
        res.json({ success: true, message: 'Prompt deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
