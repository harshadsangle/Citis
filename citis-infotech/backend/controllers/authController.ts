import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import User from '../models/User';
import { sendPasswordReset, sendVerification, sendWelcome } from '../services/emailService';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../services/tokenService';
import { successResponse } from '../utils/apiResponse';
import { asyncHandler } from '../utils/crud';
import { AppError } from '../middleware/errorHandler';

const digest = (value: string) => crypto.createHash('sha256').update(value).digest('hex');
const randomToken = () => crypto.randomBytes(32).toString('hex');
const cookieBase = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
  domain: process.env.COOKIE_DOMAIN || undefined,
};

const issueTokens = async (res: Response, user: any) => {
  const accessToken = generateAccessToken(String(user._id), user.role);
  const refreshToken = generateRefreshToken(String(user._id), user.role);
  user.refreshToken = digest(refreshToken);
  await user.save({ validateModifiedOnly: true });
  res.cookie('accessToken', accessToken, { ...cookieBase, maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', refreshToken, { ...cookieBase, maxAge: 7 * 24 * 60 * 60 * 1000, path: '/api/v1/auth' });
  return { accessToken, refreshToken };
};

const sendSafely = (promise: Promise<unknown>) => promise.catch((error) => console.error('Email delivery failed:', error.message));

export const register = asyncHandler(async (req, res) => {
  const email = String(req.body.email).toLowerCase().trim();
  if (await User.exists({ email })) throw new AppError('An account with that email already exists', 409);
  const verificationToken = randomToken();
  const user = await User.create({
    name: req.body.name, email, password: req.body.password, role: 'guest',
    verificationToken: digest(verificationToken),
  });
  await issueTokens(res, user);
  void sendSafely(sendVerification(user.email, verificationToken));
  return successResponse(res, user, 'Registration successful', 201);
});

export const login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: String(req.body.email).toLowerCase().trim() })
    .select('+password +refreshToken');
  if (!user || !(await user.comparePassword(req.body.password))) {
    throw new AppError('Invalid email or password', 401);
  }
  const tokens = await issueTokens(res, user);
  return successResponse(res, { user, accessToken: tokens.accessToken }, 'Login successful');
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  if (token) await User.updateOne({ refreshToken: digest(token) }, { $unset: { refreshToken: 1 } });
  res.clearCookie('accessToken', cookieBase);
  res.clearCookie('refreshToken', { ...cookieBase, path: '/api/v1/auth' });
  return successResponse(res, null, 'Logged out');
});

export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!token) throw new AppError('Refresh token required', 401);
  const payload = verifyToken(token, 'refresh');
  const user = await User.findById(payload.id).select('+refreshToken');
  if (!user || !user.refreshToken || !crypto.timingSafeEqual(
    Buffer.from(user.refreshToken), Buffer.from(digest(token)),
  )) throw new AppError('Invalid refresh token', 401);
  const tokens = await issueTokens(res, user);
  return successResponse(res, { accessToken: tokens.accessToken }, 'Token refreshed');
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: String(req.body.email).toLowerCase().trim() })
    .select('+resetPasswordToken +resetPasswordExpire');
  if (user) {
    const token = randomToken();
    user.resetPasswordToken = digest(token);
    user.resetPasswordExpire = new Date(Date.now() + 60 * 60 * 1000);
    await user.save({ validateModifiedOnly: true });
    void sendSafely(sendPasswordReset(user.email, token));
  }
  return successResponse(res, null, 'If the account exists, a reset link has been sent');
});

export const resetPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: digest(String(req.params.token)),
    resetPasswordExpire: { $gt: new Date() },
  }).select('+password +resetPasswordToken +resetPasswordExpire');
  if (!user) throw new AppError('Reset token is invalid or expired', 400);
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  user.refreshToken = undefined;
  await user.save();
  await issueTokens(res, user);
  return successResponse(res, user, 'Password reset successful');
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const user = await User.findOne({ verificationToken: digest(String(req.params.token)) }).select('+verificationToken');
  if (!user) throw new AppError('Verification token is invalid', 400);
  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save({ validateModifiedOnly: true });
  void sendSafely(sendWelcome(user.email, user.name));
  return successResponse(res, user, 'Email verified');
});

export const getMe = asyncHandler(async (req, res) => successResponse(res, req.user));

export const updatePassword = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user?._id).select('+password +refreshToken');
  if (!user || !(await bcrypt.compare(req.body.currentPassword, user.password))) {
    throw new AppError('Current password is incorrect', 401);
  }
  user.password = req.body.newPassword;
  await user.save();
  await issueTokens(res, user);
  return successResponse(res, null, 'Password updated');
});
