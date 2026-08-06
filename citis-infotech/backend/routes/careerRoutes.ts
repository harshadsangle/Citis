import { Router } from 'express';
import { body, param } from 'express-validator';
import * as careers from '../controllers/careerController';
import { authorize, optionalAuth, protect } from '../middleware/auth';
import { publicWriteLimiter } from '../middleware/rateLimiter';
import { uploadResume } from '../middleware/upload';
import { validate } from '../middleware/validate';

const router = Router();
const managers = authorize('super_admin', 'admin', 'hr');
const applyRules = [
  body('name').trim().isLength({ min: 2, max: 100 }),
  body('email').isEmail().normalizeEmail(),
  body('coverLetter').optional().isLength({ max: 5000 }),
  body('skills').optional().isString(),
  body('linkedIn').optional().isString().isLength({ max: 300 }),
  body('portfolio').optional().isString().isLength({ max: 300 }),
];

router.get('/', optionalAuth, careers.getCareers);
router.get('/applications', protect, managers, careers.listApplications);
router.patch(
  '/applications/:applicationId',
  protect,
  managers,
  param('applicationId').isMongoId(),
  body('status').optional().isIn(['pending', 'reviewed', 'shortlisted', 'rejected']),
  validate,
  careers.updateApplication,
);
router.get('/slug/:slug', optionalAuth, careers.getCareerBySlug);
router.post(
  '/slug/:slug/apply',
  publicWriteLimiter,
  param('slug').trim().isLength({ min: 2, max: 200 }),
  uploadResume.single('resume'),
  applyRules,
  validate,
  careers.applyBySlug,
);
router.get('/:id', optionalAuth, param('id').isMongoId(), validate, careers.getCareer);
router.post(
  '/:id/apply',
  publicWriteLimiter,
  param('id').isMongoId(),
  uploadResume.single('resume'),
  applyRules,
  validate,
  careers.apply,
);
router.post(
  '/',
  protect,
  managers,
  [
    body('title').trim().isLength({ min: 3, max: 200 }),
    body('department').trim().notEmpty(),
    body('location').trim().notEmpty(),
    body('type').isIn(['full-time', 'part-time', 'internship', 'contract']),
    body('description').isLength({ min: 20 }),
  ],
  validate,
  careers.createCareer,
);
router.patch('/:id', protect, managers, param('id').isMongoId(), validate, careers.updateCareer);
router.delete('/:id', protect, managers, param('id').isMongoId(), validate, careers.deleteCareer);
export default router;
