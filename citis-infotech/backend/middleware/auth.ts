import { NextFunction, Request, Response } from 'express';
import User, { UserRole } from '../models/User';
import { verifyToken } from '../services/tokenService';
import { AppError } from './errorHandler';

const bearer = (req: Request): string | undefined => {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7).trim();
  return req.cookies?.accessToken;
};

const authenticate = async (req: Request, required: boolean): Promise<void> => {
  const token = bearer(req);
  if (!token) {
    if (required) throw new AppError('Authentication required', 401);
    return;
  }
  try {
    const payload = verifyToken(token);
    const user = await User.findById(payload.id);
    if (!user) throw new AppError('User no longer exists', 401);
    req.user = user;
  } catch (error) {
    if (required) throw error;
  }
};

export const protect = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    await authenticate(req, true);
    next();
  } catch (error) {
    next(error);
  }
};

export const optionalAuth = async (req: Request, _res: Response, next: NextFunction) => {
  await authenticate(req, false);
  next();
};

export const authorize = (...roles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) return next(new AppError('Forbidden', 403));
    return next();
  };
