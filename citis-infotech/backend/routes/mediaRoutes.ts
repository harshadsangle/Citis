import { Router } from 'express';
import { uploadMediaFile, uploadMediaFiles } from '../controllers/mediaController';
import { authorize, protect } from '../middleware/auth';
import { uploadMedia } from '../middleware/upload';

const router = Router();
router.use(protect, authorize('super_admin', 'admin', 'content_editor', 'hr'));
router.post('/upload', uploadMedia.single('file'), uploadMediaFile);
router.post('/upload-many', uploadMedia.array('files', 10), uploadMediaFiles);
export default router;
