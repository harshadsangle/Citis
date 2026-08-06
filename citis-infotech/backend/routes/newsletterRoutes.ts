import { Router } from 'express';
import { body, param } from 'express-validator';
import * as newsletter from '../controllers/newsletterController';
import { authorize, protect } from '../middleware/auth';
import { publicWriteLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validate';

const router = Router();
const emailRule = body('email').isEmail().normalizeEmail();
router.post('/subscribe', publicWriteLimiter, emailRule, validate, newsletter.subscribe);
router.post('/unsubscribe', publicWriteLimiter, emailRule, validate, newsletter.unsubscribe);
router.get('/', protect, authorize('super_admin', 'admin'), newsletter.getSubscribers);
router.patch(
  '/:id',
  protect,
  authorize('super_admin', 'admin'),
  param('id').isMongoId(),
  body('isActive').isBoolean(),
  validate,
  newsletter.updateSubscriber,
);
export default router;
