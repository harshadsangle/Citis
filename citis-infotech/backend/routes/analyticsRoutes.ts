import { Router } from 'express';
import { body } from 'express-validator';
import { getDashboardStats, trackEvent } from '../controllers/analyticsController';
import { authorize, protect } from '../middleware/auth';
import { publicWriteLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validate';

const router = Router();
router.get('/dashboard', protect, authorize('super_admin', 'admin'), getDashboardStats);
router.post(
  '/track',
  publicWriteLimiter,
  body('name').isString().isLength({ min: 2, max: 40 }),
  validate,
  trackEvent,
);
export default router;
