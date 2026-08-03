import { AppError } from '../middleware/errorHandler';
import { successResponse } from '../utils/apiResponse';
import { asyncHandler } from '../utils/crud';

export const uploadMediaFile = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('A file is required', 422);
  const file = req.file as Express.Multer.File & { path: string; filename: string };
  return successResponse(res, {
    url: file.path,
    publicId: file.filename,
    mimetype: file.mimetype,
    size: file.size,
  }, 'File uploaded', 201);
});

export const uploadMediaFiles = asyncHandler(async (req, res) => {
  const files = req.files as Array<Express.Multer.File & { path: string; filename: string }>;
  if (!files?.length) throw new AppError('At least one file is required', 422);
  return successResponse(res, files.map((file) => ({
    url: file.path, publicId: file.filename, mimetype: file.mimetype, size: file.size,
  })), 'Files uploaded', 201);
});
