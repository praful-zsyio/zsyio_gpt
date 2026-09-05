import mongoose, { Schema } from 'mongoose';
const UsageSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation' },
    messageId: { type: Schema.Types.ObjectId, ref: 'Message' },
    provider: { type: String, required: true },
    model: { type: String, required: true },
    inputTokens: { type: Number, default: 0 },
    outputTokens: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
    estimatedCost: { type: Number, default: 0 },
    creditsDeducted: { type: Number, default: 0 },
    requestType: { type: String, enum: ['chat', 'completion', 'embedding', 'vision'], default: 'chat' },
    latencyMs: { type: Number, default: 0 },
}, { timestamps: true });
export const Usage = mongoose.model('Usage', UsageSchema);
