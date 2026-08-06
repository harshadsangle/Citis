import { Request } from 'express';
import Career, { ICareer } from '../models/Career';
import JobApplication from '../models/JobApplication';
import { AppError } from '../middleware/errorHandler';
import { toPublicUrl } from '../middleware/upload';
import { notifyAdmins } from '../services/auditService';
import { sendCareerApplication } from '../services/emailService';
import { successResponse } from '../utils/apiResponse';
import { asyncHandler, crudController } from '../utils/crud';

const crud = crudController(Career, {
  searchFields: ['title', 'department', 'location', 'description'],
  filterFields: ['department', 'location', 'type', 'status'],
  slug: true,
  baseFilter: (req) =>
    req.user && ['super_admin', 'admin', 'hr'].includes(req.user.role) ? {} : { status: 'open' },
  allowedFields: [
    'title',
    'slug',
    'department',
    'location',
    'type',
    'description',
    'requirements',
    'responsibilities',
    'benefits',
    'salary',
    'status',
  ],
});

export const getCareers = crud.list;
export const getCareer = crud.get;
export const getCareerBySlug = crud.getBySlug;
export const createCareer = crud.create;
export const updateCareer = crud.update;
export const deleteCareer = crud.remove;

async function createApplication(req: Request, career: ICareer) {
  if (!career || career.status !== 'open') {
    throw new AppError('This position is not accepting applications', 400);
  }
  if (!req.file) throw new AppError('Resume is required', 422);
  const resume = toPublicUrl(req.file, 'resumes');
  const skills = req.body.skills
    ? String(req.body.skills)
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean)
    : [];
  const application = await JobApplication.create({
    career: career._id,
    name: req.body.name,
    email: String(req.body.email).toLowerCase().trim(),
    phone: req.body.phone,
    resume,
    coverLetter: req.body.coverLetter,
    linkedIn: req.body.linkedIn,
    portfolio: req.body.portfolio,
    skills,
  });
  await Career.updateOne({ _id: career._id }, { $inc: { applicationsCount: 1 } });
  void sendCareerApplication(application, career.title).catch((error) =>
    console.error('Application email failed:', error.message),
  );
  void notifyAdmins({
    title: 'New career application',
    message: `${application.name} applied for ${career.title}`,
    type: 'application',
    link: '/admin/careers',
  });
  return application;
}

export const apply = asyncHandler(async (req, res) => {
  const career = await Career.findById(req.params.id);
  if (!career) throw new AppError('This position is not accepting applications', 400);
  const application = await createApplication(req, career);
  return successResponse(res, application, 'Application submitted', 201);
});

export const applyBySlug = asyncHandler(async (req, res) => {
  const career = await Career.findOne({ slug: String(req.params.slug).toLowerCase().trim() });
  if (!career) throw new AppError('This position is not accepting applications', 400);
  const application = await createApplication(req, career);
  return successResponse(res, application, 'Application submitted', 201);
});

export const listApplications = asyncHandler(async (req, res) => {
  const filter: Record<string, unknown> = {};
  if (req.query.career) filter.career = req.query.career;
  if (req.query.status) filter.status = req.query.status;
  const items = await JobApplication.find(filter)
    .populate('career', 'title slug department')
    .sort('-createdAt')
    .lean();
  return successResponse(res, items);
});

export const updateApplication = asyncHandler(async (req, res) => {
  const application = await JobApplication.findByIdAndUpdate(
    req.params.applicationId,
    {
      status: req.body.status,
      adminNotes: req.body.adminNotes,
    },
    { new: true, runValidators: true },
  ).populate('career', 'title slug');
  if (!application) throw new AppError('Application not found', 404);
  return successResponse(res, application, 'Application updated');
});
