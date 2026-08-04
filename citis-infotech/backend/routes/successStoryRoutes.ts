import { Router } from 'express';
import { body, param } from 'express-validator';
import * as stories from '../controllers/successStoryController';
import { authorize, optionalAuth, protect } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();
const editors = authorize('super_admin', 'admin', 'content_editor');

router.get('/', optionalAuth, stories.getStories);
router.get('/companies', stories.listCompanies);
router.get('/slug/:slug', optionalAuth, stories.getStoryBySlug);
router.get('/:id', optionalAuth, param('id').isMongoId(), validate, stories.getStory);
router.post(
  '/',
  protect,
  editors,
  [
    body('title').trim().isLength({ min: 3, max: 200 }),
    body('studentName').trim().notEmpty(),
    body('program').trim().notEmpty(),
    body('company').trim().notEmpty(),
    body('role').trim().notEmpty(),
    body('story').isLength({ min: 20 }),
  ],
  validate,
  stories.createStory,
);
router.patch('/:id', protect, editors, param('id').isMongoId(), validate, stories.updateStory);
router.delete('/:id', protect, editors, param('id').isMongoId(), validate, stories.deleteStory);

export default router;
