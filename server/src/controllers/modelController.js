import { AIModel, DEFAULT_AI_MODELS } from '../models/AIModel.js';
import { config } from '../config/env.js';
import { memoryStore } from '../services/store/memoryStore.js';
export const getModels = async (_req, res, next) => {
    try {
        let models = DEFAULT_AI_MODELS;
        if (memoryStore.isMongoAvailable) {
            try {
                const found = await AIModel.find({ enabled: true }).sort({ provider: 1, displayName: 1 });
                if (found && found.length > 0) {
                    models = found;
                }
                else {
                    await AIModel.insertMany(DEFAULT_AI_MODELS);
                }
            }
            catch (dbErr) {
                console.warn('[Model Controller] Falling back to default registry seed');
            }
        }
        const providersStatus = {
            openai: Boolean(config.ai.openaiApiKey),
            anthropic: Boolean(config.ai.anthropicApiKey),
            gemini: Boolean(config.ai.googleAiApiKey),
            xai: Boolean(config.ai.xaiApiKey),
            'firebase-ai': Boolean(config.firebase.apiKey || config.ai.googleAiApiKey),
        };
        res.json({
            success: true,
            data: {
                models,
                providersStatus,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
