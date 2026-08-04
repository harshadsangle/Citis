import { Router } from 'express';
import { body, param } from 'express-validator';
import * as faculty from '../controllers/facultyController';
import { authorize, optionalAuth, protect } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();
const editors = authorize('super_admin', 'admin', 'content_editor');

router.get('/', optionalAuth, faculty.listTimelines);
router.get('/:key', optionalAuth, faculty.getTimeline);
router.put(
  '/:key',
  protect,
  editors,
  [
    body('title').trim().isLength({ min: 2, max: 200 }),
    body('items').isArray(),
    body('status').optional().isIn(['draft', 'published']),
  ],
  validate,
  faculty.upsertTimeline,
);

export default router;
