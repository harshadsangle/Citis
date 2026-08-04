import { Event, EventRegistration } from '../models/Event';
import AnalyticsEvent from '../models/AnalyticsEvent';
import { AppError } from '../middleware/errorHandler';
import { logActivity, notifyAdmins } from '../services/auditService';
import { successResponse } from '../utils/apiResponse';
import { asyncHandler, crudController } from '../utils/crud';

const crud = crudController(Event, {
  searchFields: ['title', 'description', 'location', 'tags'],
  filterFields: ['type', 'status', 'isOnline'],
  slug: true,
  sort: 'startsAt',
  baseFilter: (req) =>
    req.user && ['super_admin', 'admin', 'content_editor'].includes(req.user.role)
      ? {}
      : { status: 'published' },
  allowedFields: [
    'title',
    'slug',
    'type',
    'description',
    'location',
    'isOnline',
    'startsAt',
    'endsAt',
    'schedule',
    'capacity',
    'coverImage',
    'status',
    'tags',
  ],
});

export const getEvents = crud.list;
export const getEvent = crud.get;
export const getEventBySlug = crud.getBySlug;
export const createEvent = crud.create;
export const updateEvent = crud.update;
export const deleteEvent = crud.remove;

export const registerForEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event || event.status !== 'published') {
    throw new AppError('Event is not open for registration', 400);
  }
  if (event.startsAt.getTime() < Date.now()) {
    throw new AppError('This event has already started', 400);
  }

  const email = String(req.body.email).toLowerCase().trim();
  const existing = await EventRegistration.findOne({ event: event._id, email });
  if (existing) throw new AppError('You are already registered for this event', 409);

  const status = event.registeredCount >= event.capacity ? 'waitlisted' : 'registered';
  const registration = await EventRegistration.create({
    event: event._id,
    name: req.body.name,
    email,
    phone: req.body.phone,
    organization: req.body.organization,
    status,
  });

  if (status === 'registered') {
    await Event.updateOne({ _id: event._id }, { $inc: { registeredCount: 1 } });
  }

  void notifyAdmins({
    title: 'Event registration',
    message: `${registration.name} registered for ${event.title} (${status}).`,
    type: 'application',
    link: `/admin/events`,
  });
  void AnalyticsEvent.create({
    name: 'event_register',
    resourceType: 'event',
    resourceId: String(event._id),
    path: `/events/${event.slug}`,
  });

  return successResponse(res, registration, 'Registration received', 201);
});

export const listRegistrations = asyncHandler(async (req, res) => {
  const registrations = await EventRegistration.find({ event: req.params.id })
    .sort('-createdAt')
    .lean();
  return successResponse(res, registrations);
});
