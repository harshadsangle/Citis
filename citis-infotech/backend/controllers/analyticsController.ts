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
import { successResponse } from '../utils/apiResponse';
import { asyncHandler } from '../utils/crud';

export const getDashboardStats = asyncHandler(async (_req, res) => {
  const [
    users, blogs, products, careers, testimonials, clients, contacts, unreadContacts,
    subscribers, inquiries, applications, caseStudies, recentContacts, recentApplications,
  ] = await Promise.all([
    User.countDocuments(), Blog.countDocuments(), Product.countDocuments(), Career.countDocuments(),
    Testimonial.countDocuments(), Client.countDocuments(), Contact.countDocuments(),
    Contact.countDocuments({ status: 'new' }), Newsletter.countDocuments({ isActive: true }),
    Inquiry.countDocuments(), JobApplication.countDocuments(), CaseStudy.countDocuments(),
    Contact.find().sort('-createdAt').limit(5).lean(),
    JobApplication.find().populate('career', 'title slug').sort('-createdAt').limit(5).lean(),
  ]);
  return successResponse(res, {
    counts: { users, blogs, products, careers, testimonials, clients, contacts, unreadContacts,
      subscribers, inquiries, applications, caseStudies },
    recent: { contacts: recentContacts, applications: recentApplications },
  });
});
