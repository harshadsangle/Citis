import { AppError } from '../middleware/errorHandler';
import { toPublicUrl } from '../middleware/upload';
import { successResponse } from '../utils/apiResponse';
import { asyncHandler } from '../utils/crud';

const mapFile = (file: Express.Multer.File, subdir: string) => ({
  url: toPublicUrl(file, subdir),
  filename: file.filename,
  mimetype: file.mimetype,
  size: file.size,
});

export const uploadMediaFile = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('A file is required', 422);
  return successResponse(res, mapFile(req.file, 'media'), 'File uploaded', 201);
});

export const uploadMediaFiles = asyncHandler(async (req, res) => {
  const files = req.files as Express.Multer.File[] | undefined;
  if (!files?.length) throw new AppError('At least one file is required', 422);
  return successResponse(
    res,
    files.map((file) => mapFile(file, 'media')),
    'Files uploaded',
    201,
  );
});
