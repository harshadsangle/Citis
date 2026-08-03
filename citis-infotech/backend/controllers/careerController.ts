import Career from '../models/Career';
import JobApplication from '../models/JobApplication';
import { AppError } from '../middleware/errorHandler';
import { toPublicUrl } from '../middleware/upload';
import { sendCareerApplication } from '../services/emailService';
import { successResponse } from '../utils/apiResponse';
import { asyncHandler, crudController } from '../utils/crud';

const crud = crudController(Career, {
  searchFields: ['title', 'department', 'location', 'description'],
  filterFields: ['department', 'location', 'type', 'status'],
  slug: true,
  baseFilter: (req) => req.user && ['super_admin', 'admin', 'hr'].includes(req.user.role)
    ? {} : { status: 'open' },
  allowedFields: ['title', 'slug', 'department', 'location', 'type', 'description',
    'requirements', 'responsibilities', 'benefits', 'salary', 'status'],
});

export const getCareers = crud.list;
export const getCareer = crud.get;
export const getCareerBySlug = crud.getBySlug;
export const createCareer = crud.create;
export const updateCareer = crud.update;
export const deleteCareer = crud.remove;

export const apply = asyncHandler(async (req, res) => {
  const career = await Career.findById(req.params.id);
  if (!career || career.status !== 'open') throw new AppError('This position is not accepting applications', 400);
  if (!req.file) throw new AppError('Resume is required', 422);
  const resume = toPublicUrl(req.file, 'resumes');
  const application = await JobApplication.create({
    career: career._id,
    name: req.body.name,
    email: String(req.body.email).toLowerCase().trim(),
    phone: req.body.phone,
    resume,
    coverLetter: req.body.coverLetter,
  });
  await Career.updateOne({ _id: career._id }, { $inc: { applicationsCount: 1 } });
  void sendCareerApplication(application, career.title)
    .catch((error) => console.error('Application email failed:', error.message));
  return successResponse(res, application, 'Application submitted', 201);
});
