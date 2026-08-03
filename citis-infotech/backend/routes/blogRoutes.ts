import { Router } from 'express';
import { body, param } from 'express-validator';
import * as blogs from '../controllers/blogController';
import { authorize, optionalAuth, protect } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();
const editors = authorize('super_admin', 'admin', 'content_editor');
const rules = [
  body('title').trim().isLength({ min: 3, max: 200 }),
  body('excerpt').trim().isLength({ min: 10, max: 500 }),
  body('content').isLength({ min: 20 }),
  body('category').isMongoId(),
  body('status').optional().isIn(['draft', 'published']),
];
router.get('/', optionalAuth, blogs.getBlogs);
router.get('/slug/:slug', optionalAuth, blogs.getBlogBySlug);
router.get('/:id', optionalAuth, param('id').isMongoId(), validate, blogs.getBlog);
router.post('/', protect, editors, rules, validate, blogs.createBlog);
router.patch('/:id', protect, editors, param('id').isMongoId(), validate, blogs.updateBlog);
router.delete('/:id', protect, editors, param('id').isMongoId(), validate, blogs.deleteBlog);
export default router;
