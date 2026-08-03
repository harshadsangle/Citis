import { Router } from 'express';
import { getDashboardStats } from '../controllers/analyticsController';
import { authorize, protect } from '../middleware/auth';

const router = Router();
router.get('/dashboard', protect, authorize('super_admin', 'admin'), getDashboardStats);
export default router;
