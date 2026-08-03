import { Router } from 'express';
import { body, param } from 'express-validator';
import * as studies from '../controllers/caseStudyController';
import { authorize, optionalAuth, protect } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();
const editors = [protect, authorize('super_admin', 'admin', 'content_editor')];
router.get('/', optionalAuth, studies.getCaseStudies);
router.get('/slug/:slug', optionalAuth, studies.getCaseStudyBySlug);
router.get('/:id', optionalAuth, param('id').isMongoId(), validate, studies.getCaseStudy);
router.post('/', editors, [
  body('title').trim().isLength({ min: 3, max: 200 }),
  body('client').trim().notEmpty(), body('industry').trim().notEmpty(),
  body('challenge').isLength({ min: 20 }), body('solution').isLength({ min: 20 }),
], validate, studies.createCaseStudy);
router.patch('/:id', editors, param('id').isMongoId(), validate, studies.updateCaseStudy);
router.delete('/:id', editors, param('id').isMongoId(), validate, studies.deleteCaseStudy);
export default router;
