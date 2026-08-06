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
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }),
    Category.findOneAndUpdate({ slug: 'digital-learning', type: 'product' },
      { name: 'Digital Learning', description: 'Modern digital learning products' },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }),
  ]);

  await Promise.all([
    Blog.findOneAndUpdate({ slug: 'future-of-digital-learning' }, {
      title: 'The Future of Digital Learning', excerpt: 'How accessible platforms improve learning outcomes.',
      content: 'Digital learning succeeds when technology, pedagogy, and accessible design work together.',
      category: blogCategory._id, author: admin._id, tags: ['edtech', 'learning'],
      status: 'published', publishedAt: new Date(),
    }, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }),
    Product.findOneAndUpdate({ slug: 'learning-management-platform' }, {
      title: 'Learning Management Platform', description: 'A complete platform for delivering and measuring learning.',
      shortDescription: 'Create, deliver, and analyze engaging digital learning.',
      features: ['Course authoring', 'Learner analytics'], benefits: ['Faster delivery', 'Measurable outcomes'],
      learningOutcomes: ['Manage cohorts', 'Interpret learning analytics'],
      curriculum: [{ title: 'Platform Essentials', duration: '2 hours' }],
      category: productCategory._id, status: 'published', order: 1,
    }, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }),
    Career.findOneAndUpdate({ slug: 'learning-experience-designer' }, {
      title: 'Learning Experience Designer', department: 'Learning Design', location: 'Bengaluru / Hybrid',
      type: 'full-time',
      description: 'Design rigorous, inclusive learning experiences for university and workforce programmes.',
      requirements: [
        'Experience designing adult or higher-education learning.',
        'Strong portfolio showing outcomes, assessment, and digital pedagogy.',
        'Clear writing, facilitation, and stakeholder collaboration skills.',
      ],
      responsibilities: [
        'Translate competency maps into learning journeys, activities, and assessments.',
        'Co-create with faculty, subject experts, and industry mentors.',
        'Use learner evidence to iterate content and facilitation guides.',
      ],
      benefits: ['Hybrid work', 'Learning budget'], status: 'open',
    }, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }),
    Career.findOneAndUpdate({ slug: 'stem-program-manager' }, {
      title: 'STEM Programme Manager', department: 'School Education', location: 'Bengaluru with travel',
      type: 'full-time',
      description: 'Lead multi-school STEM implementation from educator onboarding through impact review.',
      requirements: [
        'Programme management experience in K–12 education.',
        'Understanding of inquiry-based STEM and teacher development.',
        'Comfort with data, field travel, and senior stakeholder communication.',
      ],
      responsibilities: [
        'Own delivery plans, school relationships, and facilitator quality.',
        'Coach field teams and coordinate teacher learning communities.',
        'Track participation, implementation fidelity, and learner outcomes.',
      ],
      benefits: ['Travel support', 'Field learning'], status: 'open',
    }, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }),
    Career.findOneAndUpdate({ slug: 'full-stack-engineer-learning-platforms' }, {
      title: 'Full-stack Engineer — Learning Platforms', department: 'Product & Engineering',
      location: 'Bengaluru / Hybrid', type: 'full-time',
      description: 'Build accessible, reliable learning products used by educators and learners at scale.',
      requirements: [
        'Production experience with TypeScript, React, Node.js, and relational data.',
        'Strong API, testing, and cloud engineering fundamentals.',
        'Care for accessibility, privacy, and maintainable product design.',
      ],
      responsibilities: [
        'Develop product capabilities across modern web services and interfaces.',
        'Partner with design and learning teams on accessible user experiences.',
        'Improve observability, security, performance, and release quality.',
      ],
      benefits: ['Hybrid work', 'Hardware stipend'], status: 'open',
    }, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }),
    Career.findOneAndUpdate({ slug: 'university-partnerships-lead' }, {
      title: 'University Partnerships Lead', department: 'Institutional Partnerships',
      location: 'India / Remote', type: 'full-time',
      description: 'Build long-term university partnerships around curriculum, capability, and student progression.',
      requirements: [
        'Experience in higher-education partnerships or academic solutions.',
        'Consultative discovery and proposal development capability.',
        'Executive communication and complex programme ownership.',
      ],
      responsibilities: [
        'Discover institutional priorities and shape measurable programmes.',
        'Coordinate academic, product, delivery, and industry stakeholders.',
        'Steward partnership reviews, expansion plans, and outcome reporting.',
      ],
      benefits: ['Remote work', 'Travel for key partners'], status: 'open',
    }, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }),
    Testimonial.findOneAndUpdate({ name: 'Sample Learner', company: 'CITIS Partner' }, {
      role: 'Learning Lead', content: 'CITIS helped our team launch effective learning at scale.',
      rating: 5, featured: true, order: 1,
    }, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }),
    Client.findOneAndUpdate({ name: 'CITIS Partner' }, {
      logo: '/icons/icon-192.svg', featured: true, order: 1,
    }, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }),
    CaseStudy.findOneAndUpdate({ slug: 'scalable-workforce-learning' }, {
      title: 'Scalable Workforce Learning', client: 'CITIS Partner', industry: 'Education',
      challenge: 'Deliver consistent training to a rapidly growing, distributed workforce.',
      solution: 'A modular learning platform with role-based journeys and actionable analytics.',
      results: ['Faster onboarding', 'Higher completion rates'], tags: ['learning', 'scale'],
      featured: true, status: 'published', publishedAt: new Date(),
    }, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }),
  ]);
  console.log(`Seed completed. Admin: ${email}`);
}

seed()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(() => disconnectDB());
