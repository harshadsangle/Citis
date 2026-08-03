import { Router } from 'express';
import { body, param } from 'express-validator';
import * as users from '../controllers/userController';
import { authorize, protect } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();
router.use(protect, authorize('super_admin', 'admin'));
router.get('/', users.getUsers);
router.get('/:id', param('id').isMongoId(), validate, users.getUser);
router.patch('/:id', [
  param('id').isMongoId(),
  body('email').optional().isEmail().normalizeEmail(),
  body('role').optional().isIn(['super_admin', 'admin', 'content_editor', 'hr', 'guest']),
], validate, users.updateUser);
router.delete('/:id', authorize('super_admin'), param('id').isMongoId(), validate, users.deleteUser);
export default router;
