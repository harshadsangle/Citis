import Faculty from '../models/Faculty';
import Timeline from '../models/Timeline';
import { AppError } from '../middleware/errorHandler';
import { logActivity } from '../services/auditService';
import { successResponse } from '../utils/apiResponse';
import { asyncHandler, crudController } from '../utils/crud';

const facultyCrud = crudController(Faculty, {
  searchFields: ['name', 'title', 'bio', 'expertise', 'skills'],
  filterFields: ['type', 'status'],
  slug: true,
  sort: 'order',
  baseFilter: (req) =>
    req.user && ['super_admin', 'admin', 'content_editor'].includes(req.user.role)
      ? {}
      : { status: 'published' },
  allowedFields: [
    'name',
    'slug',
    'title',
    'type',
    'bio',
    'photoUrl',
    'expertise',
    'experienceYears',
    'skills',
    'linkedinUrl',
    'order',
    'status',
  ],
});

export const getFaculty = facultyCrud.list;
export const getFacultyMember = facultyCrud.get;
export const getFacultyBySlug = facultyCrud.getBySlug;
export const createFaculty = facultyCrud.create;
export const updateFaculty = facultyCrud.update;
export const deleteFaculty = facultyCrud.remove;

export const listTimelines = asyncHandler(async (req, res) => {
  const filter: Record<string, string> = {};
  if (!req.user || !['super_admin', 'admin', 'content_editor'].includes(req.user.role)) {
    filter.status = 'published';
  }
  if (req.query.key) filter.key = String(req.query.key);
  const timelines = await Timeline.find(filter as any).lean();
  return successResponse(res, timelines);
});

export const getTimeline = asyncHandler(async (req, res) => {
  const timelineKey = String(req.params.key);
  const timeline = await Timeline.findOne({ key: timelineKey } as Record<string, string>);
  if (!timeline) throw new AppError('Timeline not found', 404);
  if (
    timeline.status !== 'published' &&
    (!req.user || !['super_admin', 'admin', 'content_editor'].includes(req.user.role))
  ) {
    throw new AppError('Timeline not found', 404);
  }
  return successResponse(res, timeline);
});

export const upsertTimeline = asyncHandler(async (req, res) => {
  const timelineKey = String(req.params.key || req.body.key);
  const timeline = await Timeline.findOneAndUpdate(
    { key: timelineKey } as Record<string, string>,
    {
      key: timelineKey,
      title: req.body.title,
      description: req.body.description,
      items: req.body.items || [],
      status: req.body.status || 'draft',
    } as any,
    { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true },
  );
  void logActivity(req, {
    action: 'upsert',
    resourceType: 'timeline',
    resourceId: timelineKey,
    summary: `Updated timeline ${timelineKey}`,
  });
  return successResponse(res, timeline, 'Timeline saved');
});
