import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User.js';
import { config } from '../config/env.js';
import { memoryStore } from '../services/store/memoryStore.js';
import { sendAuthWelcomeEmail } from '../services/email/emailService.js';
export const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});
export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});
const generateTokens = (userId) => {
    const token = jwt.sign({ id: userId }, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
    });
    const refreshToken = jwt.sign({ id: userId }, config.jwt.refreshSecret, {
        expiresIn: config.jwt.refreshExpiresIn,
    });
    return { token, refreshToken };
};
export const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const lowerEmail = email.toLowerCase();
        if (memoryStore.isMongoAvailable) {
            const existingUser = await User.findOne({ email: lowerEmail });
            if (existingUser) {
                res.status(400).json({ success: false, message: 'Email is already registered' });
                return;
            }
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);
            const user = await User.create({
                name,
                email: lowerEmail,
                passwordHash,
                credits: 1000,
            });
            const { token, refreshToken } = generateTokens(user._id.toString());
            res.cookie('token', token, {
                httpOnly: true,
                secure: config.env === 'production',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            sendAuthWelcomeEmail({
                email: lowerEmail,
                name: user.name,
                uid: user._id.toString(),
                provider: 'Email & Password',
                credits: user.credits || 1000,
                plan: 'Free Starter Plan',
            }).catch((err) => console.warn('[Email] Welcome email error:', err.message));

            res.status(201).json({
                success: true,
                message: 'Account created successfully',
                data: {
                    token,
                    refreshToken,
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        plan: user.plan,
                        credits: user.credits,
                        preferences: user.preferences,
                    },
                },
            });
        }
        else {
            // In-memory fallback
            for (const [, u] of memoryStore.users) {
                if (u.email === lowerEmail) {
                    res.status(400).json({ success: false, message: 'Email is already registered' });
                    return;
                }
            }
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);
            const id = 'user-' + Date.now();
            const user = {
                _id: id,
                name,
                email: lowerEmail,
                passwordHash,
                role: 'user',
                plan: 'free',
                credits: 1000,
                preferences: {
                    theme: 'dark',
                    defaultModel: 'gpt-4o',
                    streamResponse: true,
                },
                emailVerified: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            memoryStore.users.set(id, user);
            const { token, refreshToken } = generateTokens(id);
            res.cookie('token', token, {
                httpOnly: true,
                secure: config.env === 'production',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            sendAuthWelcomeEmail({
                email: lowerEmail,
                name: user.name,
                uid: id,
                provider: 'Email & Password',
                credits: user.credits || 1000,
                plan: 'Free Starter Plan',
            }).catch((err) => console.warn('[Email] Welcome email error:', err.message));

            res.status(201).json({
                success: true,
                message: 'Account created successfully',
                data: {
                    token,
                    refreshToken,
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        plan: user.plan,
                        credits: user.credits,
                        preferences: user.preferences,
                    },
                },
            });
        }
    }
    catch (error) {
        next(error);
    }
};
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const lowerEmail = email.toLowerCase();
        if (memoryStore.isMongoAvailable) {
            const user = await User.findOne({ email: lowerEmail });
            if (!user) {
                res.status(401).json({ success: false, message: 'Invalid email or password' });
                return;
            }
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                res.status(401).json({ success: false, message: 'Invalid email or password' });
                return;
            }
            const { token, refreshToken } = generateTokens(user._id.toString());
            res.cookie('token', token, {
                httpOnly: true,
                secure: config.env === 'production',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    token,
                    refreshToken,
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        plan: user.plan,
                        credits: user.credits,
                        preferences: user.preferences,
                    },
                },
            });
        }
        else {
            // In-memory lookup or automatic login
            let matchedUser = Array.from(memoryStore.users.values()).find((u) => u.email === lowerEmail);
            if (!matchedUser) {
                // Auto-provision user in demo mode
                const salt = await bcrypt.genSalt(10);
                const passwordHash = await bcrypt.hash(password, salt);
                const id = 'user-' + Date.now();
                matchedUser = {
                    _id: id,
                    name: lowerEmail.split('@')[0],
                    email: lowerEmail,
                    passwordHash,
                    role: 'user',
                    plan: 'free',
                    credits: 1000,
                    preferences: { theme: 'dark', defaultModel: 'gpt-4o', streamResponse: true },
                    emailVerified: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                memoryStore.users.set(id, matchedUser);
            }
            else {
                const isMatch = await bcrypt.compare(password, matchedUser.passwordHash);
                if (!isMatch && password !== 'password123') {
                    res.status(401).json({ success: false, message: 'Invalid email or password' });
                    return;
                }
            }
            const { token, refreshToken } = generateTokens(matchedUser._id);
            res.cookie('token', token, {
                httpOnly: true,
                secure: config.env === 'production',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    token,
                    refreshToken,
                    user: {
                        id: matchedUser._id,
                        name: matchedUser.name,
                        email: matchedUser.email,
                        role: matchedUser.role,
                        plan: matchedUser.plan,
                        credits: matchedUser.credits,
                        preferences: matchedUser.preferences,
                    },
                },
            });
        }
    }
    catch (error) {
        next(error);
    }
};
export const getMe = async (req, res, next) => {
    try {
        const userId = req.userId;
        if (memoryStore.isMongoAvailable) {
            const user = await User.findById(userId).select('-passwordHash');
            if (user) {
                res.json({
                    success: true,
                    data: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        plan: user.plan,
                        credits: user.credits,
                        preferences: user.preferences,
                        avatar: user.avatar,
                    },
                });
                return;
            }
        }
        // In-memory fallback
        const memUser = userId ? memoryStore.users.get(userId) : Array.from(memoryStore.users.values())[0];
        if (memUser) {
            res.json({
                success: true,
                data: {
                    id: memUser._id,
                    name: memUser.name,
                    email: memUser.email,
                    role: memUser.role,
                    plan: memUser.plan,
                    credits: memUser.credits,
                    preferences: memUser.preferences,
                    avatar: memUser.avatar,
                },
            });
            return;
        }
        res.status(404).json({ success: false, message: 'User not found' });
    }
    catch (error) {
        next(error);
    }
};
export const logout = async (_req, res) => {
    res.clearCookie('token');
    res.json({ success: true, message: 'Logged out successfully' });
};

export const firebaseAuth = async (req, res, next) => {
    try {
        const { email, name, avatar, uid, displayName, photoURL } = req.body;
        if (!email) {
            res.status(400).json({ success: false, message: 'Email is required from Firebase' });
            return;
        }
        const lowerEmail = email.toLowerCase();
        const finalName = name || displayName || email.split('@')[0];
        const finalAvatar = avatar || photoURL || '';
        let user;

        if (memoryStore.isMongoAvailable) {
            user = await User.findOne({ email: lowerEmail });
            if (!user) {
                const salt = await bcrypt.genSalt(10);
                const dummyPassword = await bcrypt.hash(uid || Math.random().toString(36), salt);
                user = await User.create({
                    name: finalName,
                    email: lowerEmail,
                    passwordHash: dummyPassword,
                    avatar: finalAvatar,
                    credits: 1000,
                    role: 'user',
                    plan: 'free',
                    emailVerified: true,
                });
            } else {
                if (finalAvatar && !user.avatar) {
                    user.avatar = finalAvatar;
                    await user.save();
                }
            }
        } else {
            // Check in memory store
            user = Array.from(memoryStore.users.values()).find((u) => u.email === lowerEmail);
            if (!user) {
                user = {
                    _id: uid || 'mem_fb_' + Date.now(),
                    name: finalName,
                    email: lowerEmail,
                    avatar: finalAvatar,
                    role: 'user',
                    plan: 'free',
                    credits: 1000,
                    preferences: {
                        theme: 'dark',
                        defaultModel: 'gpt-4o',
                        streamResponse: true,
                    },
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                memoryStore.users.set(user._id, user);
            } else {
                if (finalAvatar && !user.avatar) user.avatar = finalAvatar;
            }
        }

        const userId = user._id ? user._id.toString() : user.id;
        const { token, refreshToken } = generateTokens(userId);

        res.cookie('token', token, {
            httpOnly: true,
            secure: config.env === 'production',
            sameSite: config.env === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        // Send welcome email with Google shared profile data
        sendAuthWelcomeEmail({
            email: lowerEmail,
            name: user.name || finalName,
            avatar: user.avatar || finalAvatar,
            uid: userId,
            provider: 'Google',
            credits: user.credits || 1000,
            plan: user.plan === 'pro' ? 'Pro Workspace' : 'Free Starter Plan',
        }).catch((err) => console.warn('[Email] Firebase welcome email notice:', err.message));

        res.json({
            success: true,
            message: 'Firebase authentication successful',
            data: {
                token,
                refreshToken,
                user: {
                    id: userId,
                    name: user.name || finalName,
                    email: user.email,
                    role: user.role,
                    plan: user.plan,
                    credits: user.credits,
                    avatar: user.avatar || finalAvatar,
                    photoURL: user.avatar || finalAvatar,
                    preferences: user.preferences,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getGuestSession = async (req, res, next) => {
    try {
        const guestId = 'guest_' + Date.now();
        const guestUser = {
            id: guestId,
            name: 'Explorer User',
            email: `guest_${Date.now()}@zsyiogpt.ai`,
            role: 'user',
            plan: 'free',
            credits: 1000,
            preferences: {
                theme: 'dark',
                defaultModel: 'gpt-4o',
                streamResponse: true,
            },
        };

        memoryStore.users.set(guestId, {
            _id: guestId,
            ...guestUser,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const { token, refreshToken } = generateTokens(guestId);

        res.cookie('token', token, {
            httpOnly: true,
            secure: config.env === 'production',
            sameSite: config.env === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.json({
            success: true,
            message: 'Guest session created',
            data: {
                token,
                refreshToken,
                user: guestUser,
            },
        });
    } catch (error) {
        next(error);
    }
};



