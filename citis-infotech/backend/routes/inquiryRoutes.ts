import { Router } from 'express';
import { body, param } from 'express-validator';
import * as inquiries from '../controllers/inquiryController';
import { authorize, protect } from '../middleware/auth';
import { publicWriteLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validate';

const router = Router();
router.post('/', publicWriteLimiter, [
  body('name').trim().isLength({ min: 2, max: 100 }),
  body('email').isEmail().normalizeEmail(),
  body('partnershipType').trim().isLength({ min: 2, max: 100 }),
  body('message').trim().isLength({ min: 10, max: 5000 }),
], validate, inquiries.createInquiry);
router.use(protect, authorize('super_admin', 'admin'));
router.get('/', inquiries.getInquiries);
router.patch('/:id', [param('id').isMongoId(), body('status').isIn(['new', 'read', 'replied'])], validate, inquiries.updateInquiry);
export default router;
