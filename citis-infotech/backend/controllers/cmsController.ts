import CmsSection from '../models/CmsSection';
import { AppError } from '../middleware/errorHandler';
import { logActivity } from '../services/auditService';
import { successResponse } from '../utils/apiResponse';
import { asyncHandler } from '../utils/crud';

export const listSections = asyncHandler(async (req, res) => {
  const filter: Record<string, unknown> = {};
  if (req.query.page) filter.page = req.query.page;
  if (!req.user || !['super_admin', 'admin', 'content_editor'].includes(req.user.role)) {
    filter.status = 'published';
  } else if (req.query.status) {
    filter.status = req.query.status;
  }
  const sections = await CmsSection.find(filter).sort('key').lean();
  return successResponse(res, sections);
});

export const getSection = asyncHandler(async (req, res) => {
  const section = await CmsSection.findOne({ key: req.params.key });
  if (!section) throw new AppError('CMS section not found', 404);
  if (
    section.status !== 'published' &&
    (!req.user || !['super_admin', 'admin', 'content_editor'].includes(req.user.role))
  ) {
    throw new AppError('CMS section not found', 404);
  }
  return successResponse(res, section);
});

export const upsertSection = asyncHandler(async (req, res) => {
  const key = String(req.body.key || req.params.key).toLowerCase().trim();
  if (!key) throw new AppError('CMS section key is required', 422);

  const section = await CmsSection.findOneAndUpdate(
    { key },
    {
      key,
      page: req.body.page,
      title: req.body.title,
      content: req.body.content ?? {},
      status: req.body.status || 'draft',
      updatedBy: req.user?.email,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true },
  );

  void logActivity(req, {
    action: 'upsert',
    resourceType: 'cms',
    resourceId: key,
    summary: `Updated CMS section ${key}`,
  });

  return successResponse(res, section, 'CMS section saved');
});

export const deleteSection = asyncHandler(async (req, res) => {
  const key = String(req.params.key);
  const section = await CmsSection.findOneAndDelete({ key });
  if (!section) throw new AppError('CMS section not found', 404);
  void logActivity(req, {
    action: 'delete',
    resourceType: 'cms',
    resourceId: key,
    summary: `Deleted CMS section ${key}`,
  });
  return successResponse(res, null, 'CMS section deleted');
});
