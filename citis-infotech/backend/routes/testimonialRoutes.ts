import { Router } from 'express';
import { body, param } from 'express-validator';
import * as items from '../controllers/testimonialController';
import { authorize, protect } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();
const editors = [protect, authorize('super_admin', 'admin', 'content_editor')];
router.get('/', items.getTestimonials);
router.get('/:id', param('id').isMongoId(), validate, items.getTestimonial);
router.post('/', editors, [
  body('name').trim().notEmpty(), body('role').trim().notEmpty(),
  body('content').isLength({ min: 10, max: 2000 }), body('rating').optional().isInt({ min: 1, max: 5 }),
], validate, items.createTestimonial);
router.patch('/:id', editors, param('id').isMongoId(), validate, items.updateTestimonial);
router.delete('/:id', editors, param('id').isMongoId(), validate, items.deleteTestimonial);
export default router;
