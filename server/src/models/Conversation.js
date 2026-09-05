import mongoose, { Schema } from 'mongoose';
const ConversationSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', default: null },
    title: { type: String, default: 'New Conversation', trim: true },
    provider: { type: String, default: 'openai' },
    model: { type: String, default: 'gpt-4o' },
    systemPrompt: { type: String, default: 'You are ZsyioGPT, an advanced, thoughtful, and precise AI assistant.' },
    temperature: { type: Number, default: 0.7 },
    isPinned: { type: Boolean, default: false },
    archived: { type: Boolean, default: false },
    messageCount: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
}, { timestamps: true });
export const Conversation = mongoose.model('Conversation', ConversationSchema);
