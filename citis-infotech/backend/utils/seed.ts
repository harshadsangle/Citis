import 'dotenv/config';
import { connectDB, disconnectDB } from '../config/db';
import Blog from '../models/Blog';
import Career from '../models/Career';
import CaseStudy from '../models/CaseStudy';
import Category from '../models/Category';
import Client from '../models/Client';
import Product from '../models/Product';
import Testimonial from '../models/Testimonial';
import User from '../models/User';

async function seed() {
  const email = (process.env.SEED_ADMIN_EMAIL || '').toLowerCase().trim();
  const password = process.env.SEED_ADMIN_PASSWORD || '';
  if (!email || password.length < 8 || password === 'change-me-before-seeding') {
    throw new Error('Set SEED_ADMIN_EMAIL and a secure SEED_ADMIN_PASSWORD before seeding');
  }
  await connectDB();
  let admin = await User.findOne({ email });
  if (!admin) {
    admin = await User.create({
      name: process.env.SEED_ADMIN_NAME || 'Super Admin',
      email,
      password,
      role: 'super_admin',
      isVerified: true,
    });
  } else {
    admin.name = process.env.SEED_ADMIN_NAME || admin.name;
    admin.role = 'super_admin';
    admin.isVerified = true;
    await admin.save();
  }

  const [blogCategory, productCategory] = await Promise.all([
    Category.findOneAndUpdate({ slug: 'insights', type: 'blog' },
      { name: 'Insights', description: 'EdTech news and practical insights' },
      { upsert: true, new: true, setDefaultsOnInsert: true }),
    Category.findOneAndUpdate({ slug: 'digital-learning', type: 'product' },
      { name: 'Digital Learning', description: 'Modern digital learning products' },
      { upsert: true, new: true, setDefaultsOnInsert: true }),
  ]);

  await Promise.all([
    Blog.findOneAndUpdate({ slug: 'future-of-digital-learning' }, {
      title: 'The Future of Digital Learning', excerpt: 'How accessible platforms improve learning outcomes.',
      content: 'Digital learning succeeds when technology, pedagogy, and accessible design work together.',
      category: blogCategory._id, author: admin._id, tags: ['edtech', 'learning'],
      status: 'published', publishedAt: new Date(),
    }, { upsert: true, new: true, setDefaultsOnInsert: true }),
    Product.findOneAndUpdate({ slug: 'learning-management-platform' }, {
      title: 'Learning Management Platform', description: 'A complete platform for delivering and measuring learning.',
      shortDescription: 'Create, deliver, and analyze engaging digital learning.',
      features: ['Course authoring', 'Learner analytics'], benefits: ['Faster delivery', 'Measurable outcomes'],
      learningOutcomes: ['Manage cohorts', 'Interpret learning analytics'],
      curriculum: [{ title: 'Platform Essentials', duration: '2 hours' }],
      category: productCategory._id, status: 'published', order: 1,
    }, { upsert: true, new: true, setDefaultsOnInsert: true }),
    Career.findOneAndUpdate({ slug: 'instructional-designer' }, {
      title: 'Instructional Designer', department: 'Learning Design', location: 'Remote',
      type: 'full-time', description: 'Design evidence-based, engaging digital learning experiences.',
      requirements: ['Experience designing online learning'], responsibilities: ['Create learning journeys'],
      benefits: ['Remote work'], status: 'open',
    }, { upsert: true, new: true, setDefaultsOnInsert: true }),
    Testimonial.findOneAndUpdate({ name: 'Sample Learner', company: 'CITIS Partner' }, {
      role: 'Learning Lead', content: 'CITIS helped our team launch effective learning at scale.',
      rating: 5, featured: true, order: 1,
    }, { upsert: true, new: true, setDefaultsOnInsert: true }),
    Client.findOneAndUpdate({ name: 'CITIS Partner' }, {
      logo: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', featured: true, order: 1,
    }, { upsert: true, new: true, setDefaultsOnInsert: true }),
    CaseStudy.findOneAndUpdate({ slug: 'scalable-workforce-learning' }, {
      title: 'Scalable Workforce Learning', client: 'CITIS Partner', industry: 'Education',
      challenge: 'Deliver consistent training to a rapidly growing, distributed workforce.',
      solution: 'A modular learning platform with role-based journeys and actionable analytics.',
      results: ['Faster onboarding', 'Higher completion rates'], tags: ['learning', 'scale'],
      featured: true, status: 'published', publishedAt: new Date(),
    }, { upsert: true, new: true, setDefaultsOnInsert: true }),
  ]);
  console.log(`Seed completed. Admin: ${email}`);
}

seed()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(() => disconnectDB());
