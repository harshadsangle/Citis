import { Router } from 'express';
import { body, param } from 'express-validator';
import * as comments from '../controllers/commentController';
import { authorize, protect } from '../middleware/auth';
import { publicWriteLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validate';

const router = Router();
const editors = authorize('super_admin', 'admin', 'content_editor');

router.get('/blog/:blogId', param('blogId').isMongoId(), validate, comments.listApprovedByBlog);
router.post(
  '/',
  publicWriteLimiter,
  [
    body('blog').isMongoId(),
    body('name').trim().isLength({ min: 2, max: 100 }),
    body('email').isEmail().normalizeEmail(),
    body('body').trim().isLength({ min: 3, max: 2000 }),
  ],
  validate,
  comments.createComment,
);
router.get('/', protect, editors, comments.listComments);
router.patch(
  '/:id/moderate',
  protect,
  editors,
  param('id').isMongoId(),
  body('status').isIn(['approved', 'rejected', 'pending']),
  validate,
  comments.moderateComment,
);
router.delete('/:id', protect, editors, param('id').isMongoId(), validate, comments.deleteComment);

export default router;
