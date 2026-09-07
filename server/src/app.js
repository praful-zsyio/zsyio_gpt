import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Set trust proxy for deployment behind Render, Railway, Vercel, Cloudflare, Nginx
app.set('trust proxy', 1);

// Build allowed origins list
const cleanUrl = (url) => (url || '').trim().replace(/\/+$/, '');
const allowedOrigins = [
    cleanUrl(config.clientUrl),
    ...config.additionalClientUrls.map(cleanUrl),
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5000',
    'http://127.0.0.1:5000',
].filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);

        const cleanOrigin = cleanUrl(origin);
        const isExplicitlyAllowed = allowedOrigins.some(allowed => {
            if (allowed === '*' || allowed === cleanOrigin) return true;
            if (allowed.includes('*')) {
                const regex = new RegExp('^' + allowed.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
                return regex.test(cleanOrigin);
            }
            return false;
        });

        // In production or development, allow valid origins smoothly
        if (isExplicitlyAllowed || cleanOrigin.endsWith('.vercel.app') || cleanOrigin.endsWith('.onrender.com') || cleanOrigin.endsWith('.railway.app')) {
            callback(null, true);
        } else {
            // Reflect origin to ensure deployed web app runs smoothly
            callback(null, true);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'X-Accel-Buffering'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Canonical upload directories: check server/uploads and root uploads
const candidateUploadDirs = [
    path.resolve(process.cwd(), 'uploads'),
    path.resolve(process.cwd(), 'server', 'uploads'),
    path.resolve(__dirname, '../../uploads'),
    path.resolve(__dirname, '../uploads'),
];

let primaryUploadDir = candidateUploadDirs[0];
for (const dir of candidateUploadDirs) {
    if (fs.existsSync(dir)) {
        primaryUploadDir = dir;
        break;
    }
}
if (!fs.existsSync(primaryUploadDir)) {
    fs.mkdirSync(primaryUploadDir, { recursive: true });
}

// Serve static uploads from all found directories so sample media & new uploads are both accessible
candidateUploadDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
        app.use('/uploads', express.static(dir));
    }
});

// Universal Health Check Endpoint (for Docker, AWS, Render, Railway, K8s)
app.get(['/health', '/api/health', '/api/v1/health'], (_req, res) => {
    res.json({
        status: 'ok',
        service: 'ZsyioGPT Unified AI & Media Gateway',
        environment: config.env,
        timestamp: new Date().toISOString(),
    });
});

// API Routes
app.use('/api/v1', apiRouter);


// Serve frontend static build in production
const candidateDistDirs = [
    path.resolve(process.cwd(), 'frontend', 'dist'),
    path.resolve(process.cwd(), '../frontend/dist'),
    path.resolve(process.cwd(), 'client', 'dist'),
    path.resolve(process.cwd(), '../client/dist'),
    path.resolve(__dirname, '../../../frontend/dist'),
    path.resolve(__dirname, '../../frontend/dist'),
    path.resolve(__dirname, '../../../client/dist'),
    path.resolve(__dirname, '../../client/dist'),
];

const distPath = candidateDistDirs.find(d => fs.existsSync(d)) || null;

if (distPath) {
    console.log(`[Static] Serving frontend from: ${distPath}`);
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
            return next();
        }
        res.sendFile(path.join(distPath, 'index.html'));
    });
}

// Global Error Handler
app.use(errorHandler);

// Bootstrap
const startServer = async () => {
    await connectDB();
    const server = app.listen(config.port, '0.0.0.0', () => {
        console.log(`=========================================`);
        console.log(`🚀 ZsyioGPT Server running on port ${config.port} (0.0.0.0)`);
        console.log(`🌐 Environment: ${config.env}`);
        console.log(`📡 AI Gateway initialized (OpenAI, Claude, Gemini, Grok)`);
        console.log(`📁 Uploads mounted from: ${primaryUploadDir}`);
        console.log(`=========================================`);
    });
    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            // Try next available port (up to 5 attempts)
            const tryPort = config.port + 1;
            console.warn(`[Server] Port ${config.port} is already in use. Retrying on port ${tryPort}...`);
            server.close();
            const fallback = app.listen(tryPort, '0.0.0.0', () => {
                console.log(`🚀 ZsyioGPT Server fallback running on port ${tryPort}`);
            });
            fallback.on('error', (err2) => {
                if (err2.code === 'EADDRINUSE') {
                    console.error(`[Server] Port ${tryPort} also in use. Please free port ${config.port} and restart.`);
                } else {
                    console.error('[Server Error]', err2);
                }
                fallback.close();
            });
        }
        else {
            console.error('[Server Error]', err);
        }
    });
};
startServer();
export default app;

