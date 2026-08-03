import fs from 'fs';
import path from 'path';
import multer from 'multer';

const uploadsRoot = path.resolve(process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads'));

const ensureDir = (dir: string) => {
  fs.mkdirSync(dir, { recursive: true });
};

const publicBaseUrl = () =>
  (process.env.API_PUBLIC_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/$/, '');

const makeStorage = (subdir: string) => {
  const destination = path.join(uploadsRoot, subdir);
  ensureDir(destination);
  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, destination),
    filename: (_req, file, cb) => {
      const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      cb(null, `${Date.now()}-${safe}`);
    },
  });
};

/** Attach a public URL on the file after disk storage completes. */
export const toPublicUrl = (file: Express.Multer.File, subdir: string): string =>
  `${publicBaseUrl()}/uploads/${subdir}/${file.filename}`;

export const getUploadsRoot = () => uploadsRoot;

const mediaTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

export const uploadImage = multer({
  storage: makeStorage('images'),
  limits: { fileSize: 8 * 1024 * 1024, files: 10 },
  fileFilter: (_req, file, cb) => cb(null, /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)),
});

export const uploadResume = multer({
  storage: makeStorage('resumes'),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) =>
    cb(
      null,
      [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ].includes(file.mimetype),
    ),
});

export const uploadMedia = multer({
  storage: makeStorage('media'),
  limits: { fileSize: 15 * 1024 * 1024, files: 10 },
  fileFilter: (_req, file, cb) => cb(null, mediaTypes.has(file.mimetype)),
});
