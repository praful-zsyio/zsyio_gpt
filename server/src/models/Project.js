import mongoose, { Schema } from 'mongoose';
const ProjectSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    instructions: { type: String, default: '' },
    defaultModel: { type: String, default: 'gpt-4o' },
    color: { type: String, default: '#6366f1' },
    icon: { type: String, default: 'folder' },
}, { timestamps: true });
export const Project = mongoose.model('Project', ProjectSchema);
