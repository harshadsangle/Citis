import Blog from '../models/Blog';
import Career from '../models/Career';
import Client from '../models/Client';
import Contact from '../models/Contact';
import Inquiry from '../models/Inquiry';
import JobApplication from '../models/JobApplication';
import Newsletter from '../models/Newsletter';
import Product from '../models/Product';
import Testimonial from '../models/Testimonial';
import User from '../models/User';
import CaseStudy from '../models/CaseStudy';
import Resource from '../models/Resource';
import Comment from '../models/Comment';
import AnalyticsEvent from '../models/AnalyticsEvent';
import { Event, EventRegistration } from '../models/Event';
import SuccessStory from '../models/SuccessStory';
import { successResponse } from '../utils/apiResponse';
import { asyncHandler } from '../utils/crud';

export const getDashboardStats = asyncHandler(async (_req, res) => {
  const [
    users,
    blogs,
    products,
    careers,
    testimonials,
    clients,
    contacts,
    unreadContacts,
    subscribers,
    inquiries,
    applications,
    caseStudies,
    resources,
    events,
    stories,
    comments,
    recentContacts,
    recentApplications,
  ] = await Promise.all([
    User.countDocuments(),
    Blog.countDocuments(),
    Product.countDocuments(),
    Career.countDocuments(),
    Testimonial.countDocuments(),
    Client.countDocuments(),
    Contact.countDocuments(),
    Contact.countDocuments({ status: 'new' }),
    Newsletter.countDocuments({ isActive: true }),
    Inquiry.countDocuments(),
    JobApplication.countDocuments(),
    CaseStudy.countDocuments(),
    Resource.countDocuments(),
    Event.countDocuments(),
    SuccessStory.countDocuments(),
    Comment.countDocuments({ status: 'pending' }),
    Contact.find().sort('-createdAt').limit(5).lean(),
    JobApplication.find().populate('career', 'title slug').sort('-createdAt').limit(5).lean(),
  ]);

  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const daily = await AnalyticsEvent.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: {
          day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          name: '$name',
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.day': 1 } },
  ]);

  const byName = await AnalyticsEvent.aggregate([
    { $match: { createdAt: { $gte: since } } },
    { $group: { _id: '$name', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  return successResponse(res, {
    counts: {
      users,
      blogs,
      products,
      careers,
      testimonials,
      clients,
      contacts,
      unreadContacts,
      subscribers,
      inquiries,
      applications,
      caseStudies,
      resources,
      events,
      stories,
      pendingComments: comments,
      eventRegistrations: await EventRegistration.countDocuments(),
      downloads: await Resource.aggregate([{ $group: { _id: null, total: { $sum: '$downloads' } } }]).then(
        (rows) => rows[0]?.total || 0,
      ),
      blogViews: await Blog.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]).then(
        (rows) => rows[0]?.total || 0,
      ),
    },
    recent: { contacts: recentContacts, applications: recentApplications },
    charts: { daily, byName },
  });
});

export const trackEvent = asyncHandler(async (req, res) => {
  const event = await AnalyticsEvent.create({
    name: req.body.name || 'custom',
    path: req.body.path,
    resourceType: req.body.resourceType,
    resourceId: req.body.resourceId,
    meta: req.body.meta,
    sessionId: req.body.sessionId || req.get('x-session-id'),
    userAgent: req.get('user-agent') || undefined,
  });
  return successResponse(res, { id: event._id }, 'Tracked', 201);
});
