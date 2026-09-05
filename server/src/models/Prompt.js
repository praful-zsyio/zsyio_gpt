import mongoose, { Schema } from 'mongoose';
const PromptSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, default: 'General' },
    content: { type: String, required: true },
    description: { type: String, default: '' },
    variables: [{ type: String }],
    costar: {
        context: { type: String, default: '' },
        objective: { type: String, default: '' },
        style: { type: String, default: '' },
        tone: { type: String, default: '' },
        audience: { type: String, default: '' },
        requirements: { type: String, default: '' },
    },
    isPublic: { type: Boolean, default: false },
    isFavorite: { type: Boolean, default: false },
    usageCount: { type: Number, default: 0 },
}, { timestamps: true });
export const Prompt = mongoose.model('Prompt', PromptSchema);
