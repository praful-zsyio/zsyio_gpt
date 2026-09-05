import mongoose, { Schema } from 'mongoose';
const FileSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', default: null },
    name: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true },
    storagePath: { type: String, required: true },
    processingStatus: { type: String, enum: ['pending', 'processed', 'failed'], default: 'processed' },
    extractedText: { type: String, default: '' },
}, { timestamps: true });
export const FileModel = mongoose.model('File', FileSchema);
