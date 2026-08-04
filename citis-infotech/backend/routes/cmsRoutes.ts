import { Router } from 'express';
import { body, param } from 'express-validator';
import * as cms from '../controllers/cmsController';
import { authorize, optionalAuth, protect } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();
const editors = authorize('super_admin', 'admin', 'content_editor');

router.get('/', optionalAuth, cms.listSections);
router.get('/:key', optionalAuth, cms.getSection);
router.put(
  '/:key',
  protect,
  editors,
  [
    body('page').isIn(['home', 'about', 'products', 'footer', 'global']),
    body('title').trim().isLength({ min: 2, max: 200 }),
    body('content').isObject(),
    body('status').optional().isIn(['draft', 'published']),
  ],
  validate,
  cms.upsertSection,
);
router.delete('/:key', protect, editors, cms.deleteSection);

export default router;
