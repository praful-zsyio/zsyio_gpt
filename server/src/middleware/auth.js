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
        if (!token) {
            res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
            return;
        }
        try {
            const decoded = jwt.verify(token, config.jwt.secret);
            req.userId = decoded.id;
            if (memoryStore.isMongoAvailable) {
                try {
                    const user = await User.findById(decoded.id).select('-passwordHash');
                    if (user) {
                        req.user = user;
                    }
                }
                catch { }
            }
            else {
                const memUser = memoryStore.users.get(decoded.id);
                if (memUser) {
                    req.user = memUser;
                }
            }
            next();
        }
        catch (err) {
            res.status(401).json({ success: false, message: 'Invalid or expired token' });
            return;
        }
    }
    catch (error) {
        next(error);
    }
};
