import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { errorResponse } from '../utils/apiResponse';

export class AppError extends Error {
  constructor(public message: string, public statusCode = 500, public details?: unknown) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export const notFound = (req: Request, _res: Response, next: NextFunction) =>
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let details = err.details;

  if (err.name === 'ValidationError') {
    status = 422;
    message = 'Validation failed';
    details = Object.values(err.errors || {}).map((e: any) => e.message);
  } else if (err.code === 11000) {
    status = 409;
    message = `Duplicate value for ${Object.keys(err.keyValue || {}).join(', ')}`;
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid resource identifier';
  } else if (err instanceof TokenExpiredError) {
    status = 401;
    message = 'Token expired';
  } else if (err instanceof JsonWebTokenError) {
    status = 401;
    message = 'Invalid token';
  } else if (err.name === 'MulterError') {
    status = 400;
    message = err.message;
  }

  if (process.env.NODE_ENV !== 'production' && status === 500) console.error(err);
  errorResponse(res, message, status, details);
};
