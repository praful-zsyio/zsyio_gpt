import mongoose, { Schema } from 'mongoose';
const MessageSchema = new Schema({
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true },
    attachments: [
        {
            name: { type: String },
            mimeType: { type: String },
            size: { type: Number },
            url: { type: String },
            extractedText: { type: String },
        },
    ],
    provider: { type: String },
    model: { type: String },
    inputTokens: { type: Number, default: 0 },
    outputTokens: { type: Number, default: 0 },
    generationTimeMs: { type: Number, default: 0 },
    error: { type: String },
}, { timestamps: true });
export const Message = mongoose.model('Message', MessageSchema);
