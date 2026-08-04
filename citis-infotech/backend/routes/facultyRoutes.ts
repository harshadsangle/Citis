import { Router } from 'express';
import { body, param } from 'express-validator';
import * as faculty from '../controllers/facultyController';
import { authorize, optionalAuth, protect } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();
const editors = authorize('super_admin', 'admin', 'content_editor');

router.get('/', optionalAuth, faculty.getFaculty);
router.get('/slug/:slug', optionalAuth, faculty.getFacultyBySlug);
router.get('/:id', optionalAuth, param('id').isMongoId(), validate, faculty.getFacultyMember);
router.post(
  '/',
  protect,
  editors,
  [
    body('name').trim().isLength({ min: 2, max: 120 }),
    body('title').trim().notEmpty(),
    body('bio').isLength({ min: 20 }),
    body('type').optional().isIn(['faculty', 'industry-expert']),
  ],
  validate,
  faculty.createFaculty,
);
router.patch('/:id', protect, editors, param('id').isMongoId(), validate, faculty.updateFaculty);
router.delete('/:id', protect, editors, param('id').isMongoId(), validate, faculty.deleteFaculty);

export default router;
