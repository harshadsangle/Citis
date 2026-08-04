import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { AppError } from './errorHandler';

const COOKIE = 'citis_csrf';
const HEADER = 'x-csrf-token';

/**
 * Double-submit CSRF for cookie-authenticated browser sessions.
 * Public anonymous writes and Bearer API clients are not blocked.
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  let token = req.cookies?.[COOKIE];
  if (!token) {
    token = crypto.randomBytes(24).toString('hex');
    res.cookie(COOKIE, token, {
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  if (req.get('authorization')?.startsWith('Bearer ')) return next();
  // Anonymous public forms (contact, apply, register) do not use access cookies yet
  if (!req.cookies?.accessToken) return next();

  const header = req.get(HEADER);
  if (!header || header !== token) {
    return next(new AppError('Invalid CSRF token', 403));
  }
  return next();
}
