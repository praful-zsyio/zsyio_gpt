import mongoose from 'mongoose';
import { config } from './env.js';
import { memoryStore } from '../services/store/memoryStore.js';
export const connectDB = async () => {
    try {
        mongoose.set('bufferCommands', false);
        const conn = await mongoose.connect(config.mongoUri, {
            serverSelectionTimeoutMS: 2000,
        });
        memoryStore.isMongoAvailable = true;
        console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    }
    catch (error) {
        memoryStore.isMongoAvailable = false;
        console.warn(`[Database] MongoDB offline (${error.message}). Backend operating in Resilient Standalone/In-Memory Mode.`);
    }
};
