import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { User } from '../models/User.js';
import { memoryStore } from '../services/store/memoryStore.js';

export const authenticate = async (req, res, next) => {
    try {
        let token;
        // Check authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }
        else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        const assignGuestUser = () => {
            req.userId = 'demo-user-1';
            req.isGuest = true;
            req.user = memoryStore.users.get('demo-user-1') || {
                id: 'demo-user-1',
                name: 'Explorer Guest',
                email: 'guest@zsyiogpt.ai',
                role: 'user',
                plan: 'free',
                credits: 1000,
            };
        };

        if (!token) {
            assignGuestUser();
            return next();
        }

        try {
            const decoded = jwt.verify(token, config.jwt.secret);
            req.userId = decoded.id;
            if (memoryStore.isMongoAvailable) {
                try {
                    const user = await User.findById(decoded.id).select('-passwordHash');
                    if (user) {
                        req.user = user;
                    } else {
                        assignGuestUser();
                    }
                }
                catch {
                    assignGuestUser();
                }
            }
            else {
                const memUser = memoryStore.users.get(decoded.id);
                if (memUser) {
                    req.user = memUser;
                } else {
                    assignGuestUser();
                }
            }
            next();
        }
        catch (err) {
            // Graceful fallback for expired or invalid tokens in production
            assignGuestUser();
            next();
        }
    }
    catch (error) {
        next(error);
    }
};

