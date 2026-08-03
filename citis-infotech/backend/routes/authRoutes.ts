import { Router } from 'express';
import { body, param } from 'express-validator';
import * as auth from '../controllers/authController';
import { protect } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validate';

const router = Router();
const password = body('password').isLength({ min: 8, max: 128 })
  .matches(/[a-z]/).matches(/[A-Z]/).matches(/\d/)
  .withMessage('Password must contain upper/lowercase letters and a number');

router.post('/register', authLimiter, [
  body('name').trim().isLength({ min: 2, max: 100 }),
  body('email').isEmail().normalizeEmail(),
  password,
], validate, auth.register);
router.post('/login', authLimiter, [body('email').isEmail().normalizeEmail(), body('password').notEmpty()], validate, auth.login);
router.post('/logout', auth.logout);
router.post('/refresh', authLimiter, auth.refreshToken);
router.post('/forgot-password', authLimiter, body('email').isEmail().normalizeEmail(), validate, auth.forgotPassword);
router.post('/reset-password/:token', authLimiter, [param('token').isHexadecimal().isLength({ min: 64, max: 64 }), password], validate, auth.resetPassword);
router.get('/verify-email/:token', param('token').isHexadecimal().isLength({ min: 64, max: 64 }), validate, auth.verifyEmail);
router.get('/me', protect, auth.getMe);
router.patch('/password', protect, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 8, max: 128 }).matches(/[a-z]/).matches(/[A-Z]/).matches(/\d/),
], validate, auth.updatePassword);

export default router;
