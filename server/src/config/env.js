import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check potential locations for .env
const envPaths = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), 'server', '.env'),
    path.resolve(__dirname, '../../../.env'),
    path.resolve(__dirname, '../../.env'),
    path.resolve(__dirname, '../.env'),
];

for (const p of envPaths) {
    if (fs.existsSync(p)) {
        dotenv.config({ path: p });
        break;
    }
}

export const config = {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '5000', 10),
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    additionalClientUrls: (process.env.ADDITIONAL_CLIENT_URLS || '').split(',').map(s => s.trim()).filter(Boolean),
    mongoUri: process.env.MONGODB_URI || process.env.MONGO_URI || '',
    sqliteDbPath: process.env.SQLITE_DB_PATH || './data/database.sqlite',
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
        nanoBananaApiKey: (process.env.NANO_BANANA_API_KEY || process.env.EXPERIENTIAL_API_KEY || '').trim(),
        experientialApiKey: (process.env.EXPERIENTIAL_API_KEY || process.env.NANO_BANANA_API_KEY || '').trim(),
        experientialBaseUrl: (process.env.EXPERIENTIAL_BASE_URL || 'https://api.experientiallabs.ai/v1').trim(),
    }
};

