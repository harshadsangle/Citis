import Resource from '../models/Resource';
import AnalyticsEvent from '../models/AnalyticsEvent';
import { AppError } from '../middleware/errorHandler';
import { toPublicUrl } from '../middleware/upload';
import { logActivity } from '../services/auditService';
import { successResponse } from '../utils/apiResponse';
import { asyncHandler, crudController } from '../utils/crud';
import slugify from '../utils/slugify';

const crud = crudController(Resource, {
  searchFields: ['title', 'description', 'tags'],
  filterFields: ['category', 'status'],
  slug: true,
  sort: '-createdAt',
  baseFilter: (req) =>
    req.user && ['super_admin', 'admin', 'content_editor'].includes(req.user.role)
      ? {}
      : { status: 'published' },
  allowedFields: [
    'title',
    'slug',
    'description',
    'category',
    'fileUrl',
    'fileName',
    'fileSize',
    'mimeType',
    'status',
    'tags',
  ],
});

export const getResources = crud.list;
export const getResource = crud.get;
export const getResourceBySlug = crud.getBySlug;
export const updateResource = crud.update;
export const deleteResource = crud.remove;

export const createResource = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('A resource file is required', 422);
  const fileUrl = toPublicUrl(req.file, 'media');
  const resource = await Resource.create({
    title: req.body.title,
    slug: req.body.slug || slugify(String(req.body.title)),
    description: req.body.description,
    category: req.body.category || 'pdf',
    fileUrl,
    fileName: req.file.originalname,
    fileSize: req.file.size,
    mimeType: req.file.mimetype,
    status: req.body.status || 'draft',
    tags: req.body.tags
      ? String(req.body.tags)
          .split(',')
          .map((tag) => tag.trim().toLowerCase())
          .filter(Boolean)
      : [],
  });
  void logActivity(req, {
    action: 'create',
    resourceType: 'resource',
    resourceId: String(resource._id),
    summary: `Uploaded resource ${resource.title}`,
  });
  return successResponse(res, resource, 'Resource created', 201);
});

export const trackDownload = asyncHandler(async (req, res) => {
  const resource = await Resource.findOneAndUpdate(
    { _id: req.params.id, status: 'published' },
    { $inc: { downloads: 1 } },
    { new: true },
  );
  if (!resource) throw new AppError('Resource not found', 404);
  void AnalyticsEvent.create({
    name: 'resource_download',
    resourceType: 'resource',
    resourceId: String(resource._id),
    path: `/resources/${resource.slug}`,
    userAgent: req.get('user-agent') || undefined,
  });
  return successResponse(res, { url: resource.fileUrl, downloads: resource.downloads });
});
