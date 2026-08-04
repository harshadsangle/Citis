import { Router } from 'express';
import { body, param } from 'express-validator';
import * as resources from '../controllers/resourceController';
import { authorize, optionalAuth, protect } from '../middleware/auth';
import { publicWriteLimiter } from '../middleware/rateLimiter';
import { uploadMedia } from '../middleware/upload';
import { validate } from '../middleware/validate';

const router = Router();
const editors = authorize('super_admin', 'admin', 'content_editor');

router.get('/', optionalAuth, resources.getResources);
router.get('/slug/:slug', optionalAuth, resources.getResourceBySlug);
router.get('/:id', optionalAuth, param('id').isMongoId(), validate, resources.getResource);
router.post(
  '/:id/download',
  publicWriteLimiter,
  param('id').isMongoId(),
  validate,
  resources.trackDownload,
);
router.post(
  '/',
  protect,
  editors,
  uploadMedia.single('file'),
  [
    body('title').trim().isLength({ min: 3, max: 200 }),
    body('description').trim().isLength({ min: 10, max: 1000 }),
  ],
  validate,
  resources.createResource,
);
router.patch('/:id', protect, editors, param('id').isMongoId(), validate, resources.updateResource);
router.delete('/:id', protect, editors, param('id').isMongoId(), validate, resources.deleteResource);

export default router;
