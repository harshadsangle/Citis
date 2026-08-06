import { Router } from 'express';
import { body, param } from 'express-validator';
import * as contacts from '../controllers/contactController';
import { authorize, protect } from '../middleware/auth';
import { publicWriteLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validate';

const router = Router();
router.post('/', publicWriteLimiter, [
  body('name').trim().isLength({ min: 2, max: 100 }),
  body('email').isEmail().normalizeEmail(),
  body('phone').optional({ values: 'falsy' }).trim().isLength({ max: 30 }),
  body('company').optional({ values: 'falsy' }).trim().isLength({ max: 120 }),
  body('subject').optional({ values: 'falsy' }).trim().isLength({ min: 3, max: 200 }),
  body('message').trim().isLength({ min: 10, max: 5000 }),
], validate, contacts.createContact);
router.use(protect, authorize('super_admin', 'admin'));
router.get('/', contacts.getContacts);
router.patch('/:id', [param('id').isMongoId(), body('status').isIn(['new', 'read', 'replied'])], validate, contacts.updateContact);
router.delete('/:id', param('id').isMongoId(), validate, contacts.deleteContact);
export default router;
