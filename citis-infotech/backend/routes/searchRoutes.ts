import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as search from '../controllers/searchController';
import { publicWriteLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validate';

const router = Router();
router.get(
  '/',
  publicWriteLimiter,
  query('q').isLength({ min: 2, max: 200 }),
  validate,
  search.globalSearch,
);
router.get('/suggestions', query('q').optional().isLength({ max: 200 }), validate, search.searchSuggestions);
export default router;
