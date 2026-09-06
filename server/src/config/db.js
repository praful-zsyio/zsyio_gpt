import mongoose from 'mongoose';
import { config } from './env.js';
import { memoryStore } from '../services/store/memoryStore.js';

// Setup connection listeners
mongoose.connection.on('connected', () => {
    memoryStore.isMongoAvailable = true;
    console.log('[Database] MongoDB connection established.');
});

mongoose.connection.on('disconnected', () => {
    memoryStore.isMongoAvailable = false;
    console.warn('[Database] MongoDB disconnected. Reverting to In-Memory & Standalone Mode.');
});

mongoose.connection.on('error', (err) => {
    memoryStore.isMongoAvailable = false;
    console.warn(`[Database] MongoDB connection error: ${err.message}`);
});

export const connectDB = async () => {
    if (!config.mongoUri) {
        memoryStore.isMongoAvailable = false;
        console.log('[Database] Operating in Standalone/In-Memory & SQLite Mode.');
        return;
    }
    try {
        mongoose.set('bufferCommands', false);
        const conn = await mongoose.connect(config.mongoUri, {
            serverSelectionTimeoutMS: 3000,
        });
        memoryStore.isMongoAvailable = true;
        console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    }
    catch (error) {
        memoryStore.isMongoAvailable = false;
        console.warn(`[Database] MongoDB offline (${error.message}). Backend operating in Resilient Standalone Mode.`);
    }
};

