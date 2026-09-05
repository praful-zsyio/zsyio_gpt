import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { uploadFile, getFiles, deleteFile, generateReferenceAnalysis } from '../controllers/fileController.js';
import { authenticate } from '../middleware/auth.js';
const router = Router();
// Ensure upload directory exists
const uploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    },
});
const upload = multer({
    storage,
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
});
router.use(authenticate);
router.post('/upload', upload.single('file'), uploadFile);
router.post('/reference-analysis', generateReferenceAnalysis);
router.get('/', getFiles);
router.delete('/:id', deleteFile);
export default router;
