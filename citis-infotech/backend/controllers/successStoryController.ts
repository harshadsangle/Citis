import SuccessStory from '../models/SuccessStory';
import { successResponse } from '../utils/apiResponse';
import { asyncHandler, crudController } from '../utils/crud';

const crud = crudController(SuccessStory, {
  searchFields: ['title', 'studentName', 'company', 'program', 'story', 'tags'],
  filterFields: ['company', 'program', 'status', 'featured'],
  slug: true,
  sort: 'order',
  baseFilter: (req) =>
    req.user && ['super_admin', 'admin', 'content_editor'].includes(req.user.role)
      ? {}
      : { status: 'published' },
  allowedFields: [
    'title',
    'slug',
    'studentName',
    'program',
    'company',
    'role',
    'story',
    'imageUrl',
    'videoUrl',
    'placementYear',
    'tags',
    'featured',
    'status',
    'order',
  ],
});

export const getStories = crud.list;
export const getStory = crud.get;
export const getStoryBySlug = crud.getBySlug;
export const createStory = crud.create;
export const updateStory = crud.update;
export const deleteStory = crud.remove;

export const listCompanies = asyncHandler(async (_req, res) => {
  const companies = await SuccessStory.distinct('company', { status: 'published' });
  return successResponse(res, companies.sort());
});
