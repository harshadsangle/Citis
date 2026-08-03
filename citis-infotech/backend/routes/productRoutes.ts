import { Router } from 'express';
import { body, param } from 'express-validator';
import * as products from '../controllers/productController';
import { authorize, optionalAuth, protect } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();
const editors = authorize('super_admin', 'admin', 'content_editor');
router.get('/', optionalAuth, products.getProducts);
router.get('/slug/:slug', optionalAuth, products.getProductBySlug);
router.get('/:id', optionalAuth, param('id').isMongoId(), validate, products.getProduct);
router.post('/', protect, editors, [
  body('title').trim().isLength({ min: 3, max: 200 }),
  body('description').isLength({ min: 20 }),
  body('shortDescription').isLength({ min: 10, max: 500 }),
  body('category').isMongoId(),
], validate, products.createProduct);
router.patch('/:id', protect, editors, param('id').isMongoId(), validate, products.updateProduct);
router.delete('/:id', protect, editors, param('id').isMongoId(), validate, products.deleteProduct);
export default router;
