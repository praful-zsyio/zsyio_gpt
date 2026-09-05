import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
const app = express();
// Middleware
app.use(cors({
    origin: [config.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
// Serve uploaded files statically
const uploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir))
    fs.mkdirSync(uploadDir, { recursive: true });
app.use('/uploads', express.static(uploadDir));
// API Routes
app.use('/api/v1', apiRouter);

// Serve frontend static build in production
const clientDistPath = path.resolve(process.cwd(), '../client/dist');
const localDistPath = path.resolve(process.cwd(), 'client/dist');
const distPath = fs.existsSync(clientDistPath) ? clientDistPath : (fs.existsSync(localDistPath) ? localDistPath : null);

if (distPath) {
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
    const server = app.listen(config.port, () => {
        console.log(`=========================================`);
        console.log(`🚀 ZsyioGPT Server running on port ${config.port}`);
        console.log(`🌐 Environment: ${config.env}`);
        console.log(`📡 AI Gateway initialized (OpenAI, Claude, Gemini, Grok)`);
        console.log(`=========================================`);
    });
    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.warn(`[Server] Port ${config.port} is already in use. Retrying on port ${config.port + 1}...`);
            server.close();
            app.listen(config.port + 1, () => {
                console.log(`🚀 ZsyioGPT Server fallback running on port ${config.port + 1}`);
            });
        }
        else {
            console.error('[Server Error]', err);
        }
    });
};
startServer();
export default app;
