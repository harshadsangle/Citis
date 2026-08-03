import CaseStudy from '../models/CaseStudy';
import { crudController } from '../utils/crud';

const crud = crudController(CaseStudy, {
  searchFields: ['title', 'client', 'industry', 'challenge', 'solution', 'tags'],
  filterFields: ['industry', 'featured', 'status'],
  slug: true,
  baseFilter: (req) => req.user && ['super_admin', 'admin', 'content_editor'].includes(req.user.role)
    ? {} : { status: 'published' },
  allowedFields: ['title', 'slug', 'client', 'industry', 'challenge', 'solution', 'results',
    'coverImage', 'gallery', 'tags', 'featured', 'status', 'publishedAt'],
});

export const getCaseStudies = crud.list;
export const getCaseStudy = crud.get;
export const getCaseStudyBySlug = crud.getBySlug;
export const createCaseStudy = crud.create;
export const updateCaseStudy = crud.update;
export const deleteCaseStudy = crud.remove;
