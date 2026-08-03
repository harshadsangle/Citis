import multer from 'multer';
import cloudinary from '../config/cloudinary';

type ResourceType = 'image' | 'raw';
type StoredFile = Express.Multer.File & { filename?: string; resourceType?: ResourceType };

class CloudinaryStorage implements multer.StorageEngine {
  constructor(
    private folder: string,
    private resourceType: (file: Express.Multer.File) => ResourceType,
    private transformImages = false,
  ) {}

  _handleFile(
    _req: Express.Request,
    file: Express.Multer.File,
    callback: (error?: unknown, info?: Partial<Express.Multer.File>) => void,
  ): void {
    const resourceType = this.resourceType(file);
    const stream = cloudinary.uploader.upload_stream({
      folder: this.folder,
      resource_type: resourceType,
      ...(this.transformImages && resourceType === 'image'
        ? { transformation: [{ quality: 'auto', fetch_format: 'auto' }] }
        : {}),
    }, (error, result) => {
      if (error) return callback(error);
      if (!result) return callback(new Error('Cloudinary upload returned no result'));
      return callback(undefined, {
        path: result.secure_url,
        filename: result.public_id,
        size: result.bytes,
        resourceType,
      } as Partial<Express.Multer.File>);
    });
    file.stream.pipe(stream);
  }

  _removeFile(_req: Express.Request, file: StoredFile, callback: (error: Error | null) => void): void {
    if (!file.filename) return callback(null);
    cloudinary.uploader.destroy(file.filename, {
      resource_type: file.resourceType || 'image',
      invalidate: true,
    }).then(() => callback(null)).catch(callback);
  }
}

const imageStorage = new CloudinaryStorage('citis-infotech/images', () => 'image', true);
const resumeStorage = new CloudinaryStorage('citis-infotech/resumes', () => 'raw');
const mediaStorage = new CloudinaryStorage(
  'citis-infotech/media',
  (file) => file.mimetype.startsWith('image/') ? 'image' : 'raw',
  true,
);

const mediaTypes = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

export const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 8 * 1024 * 1024, files: 10 },
  fileFilter: (_req, file, cb) => cb(null, /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)),
});

export const uploadResume = multer({
  storage: resumeStorage,
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) =>
    cb(null, ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.mimetype)),
});

export const uploadMedia = multer({
  storage: mediaStorage,
  limits: { fileSize: 15 * 1024 * 1024, files: 10 },
  fileFilter: (_req, file, cb) => cb(null, mediaTypes.has(file.mimetype)),
});
