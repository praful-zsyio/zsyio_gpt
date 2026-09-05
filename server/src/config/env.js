import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
export const config = {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '5000', 10),
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zsyiogpt',
    jwt: {
        secret: process.env.JWT_SECRET || 'zsyiogpt_super_secret_jwt_key_2026_secure',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'zsyiogpt_super_secret_refresh_key_2026_secure',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    },
    ai: {
        openaiApiKey: (process.env.OPENAI_API_KEY || '').trim(),
        openrouterApiKey: (process.env.OPENROUTER_API_KEY || '').trim(),
        anthropicApiKey: (process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || '').trim(),
        googleAiApiKey: (process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY || '').trim(),
        xaiApiKey: (process.env.XAI_API_KEY || process.env.GROK_API_KEY || '').trim(),
        openaiBaseUrl: (process.env.OPENAI_BASE_URL || '').trim(),
        stabilityApiKey: (process.env.STABILITY_API_KEY || '').trim(),
    }
};
