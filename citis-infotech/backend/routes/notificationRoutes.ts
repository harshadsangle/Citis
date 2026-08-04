import { Router } from 'express';
import { param } from 'express-validator';
import * as notifications from '../controllers/notificationController';
import { authorize, protect } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();
const admins = authorize('super_admin', 'admin', 'content_editor', 'hr');

router.get('/', protect, admins, notifications.listNotifications);
router.patch('/read-all', protect, admins, notifications.markAllRead);
router.patch('/:id/read', protect, admins, param('id').isMongoId(), validate, notifications.markRead);
router.get('/activity', protect, authorize('super_admin', 'admin'), notifications.listActivity);

export default router;
