import { Router } from 'express';
import { body, param } from 'express-validator';
import * as events from '../controllers/eventController';
import { authorize, optionalAuth, protect } from '../middleware/auth';
import { publicWriteLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validate';

const router = Router();
const editors = authorize('super_admin', 'admin', 'content_editor');

router.get('/', optionalAuth, events.getEvents);
router.get('/slug/:slug', optionalAuth, events.getEventBySlug);
router.get('/:id', optionalAuth, param('id').isMongoId(), validate, events.getEvent);
router.post(
  '/:id/register',
  publicWriteLimiter,
  param('id').isMongoId(),
  [
    body('name').trim().isLength({ min: 2, max: 100 }),
    body('email').isEmail().normalizeEmail(),
  ],
  validate,
  events.registerForEvent,
);
router.get(
  '/:id/registrations',
  protect,
  editors,
  param('id').isMongoId(),
  validate,
  events.listRegistrations,
);
router.post(
  '/',
  protect,
  editors,
  [
    body('title').trim().isLength({ min: 3, max: 200 }),
    body('type').isIn(['workshop', 'seminar', 'conference', 'training']),
    body('description').isLength({ min: 20 }),
    body('location').trim().notEmpty(),
    body('startsAt').isISO8601(),
    body('endsAt').isISO8601(),
  ],
  validate,
  events.createEvent,
);
router.patch('/:id', protect, editors, param('id').isMongoId(), validate, events.updateEvent);
router.delete('/:id', protect, editors, param('id').isMongoId(), validate, events.deleteEvent);

export default router;
