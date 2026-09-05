import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
const UserSchema = new Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    avatar: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    plan: { type: String, enum: ['free', 'pro', 'business', 'enterprise'], default: 'free' },
    credits: { type: Number, default: 1000 },
    preferences: {
        theme: { type: String, enum: ['dark', 'light', 'system'], default: 'dark' },
        defaultModel: { type: String, default: 'gpt-4o' },
        streamResponse: { type: Boolean, default: true },
    },
    memory: { type: String, default: '' },
    emailVerified: { type: Boolean, default: false },
}, {
    timestamps: true,
});
UserSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.passwordHash);
};
export const User = mongoose.model('User', UserSchema);
