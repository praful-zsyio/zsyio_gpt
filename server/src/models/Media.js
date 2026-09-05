import mongoose, { Schema } from 'mongoose';
const MediaSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['image', 'audio', 'video'], required: true },
    prompt: { type: String, required: true },
    url: { type: String, required: true },
    provider: { type: String, default: 'openai' },
    model: { type: String, default: 'dall-e-3' },
    aspectRatio: { type: String, default: '1:1' },
    style: { type: String, default: 'natural' },
    voice: { type: String },
    duration: { type: Number },
    creditsDeducted: { type: Number, default: 20 },
    metadata: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true });
export const Media = mongoose.model('Media', MediaSchema);
