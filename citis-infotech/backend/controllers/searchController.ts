import Blog from '../models/Blog';
import Career from '../models/Career';
import CaseStudy from '../models/CaseStudy';
import Faculty from '../models/Faculty';
import Product from '../models/Product';
import Resource from '../models/Resource';
import SearchHistory from '../models/SearchHistory';
import SuccessStory from '../models/SuccessStory';
import AnalyticsEvent from '../models/AnalyticsEvent';
import { Event } from '../models/Event';
import { AppError } from '../middleware/errorHandler';
import { successResponse } from '../utils/apiResponse';
import { asyncHandler } from '../utils/crud';

type SearchType =
  | 'all'
  | 'products'
  | 'blogs'
  | 'careers'
  | 'case-studies'
  | 'resources'
  | 'events'
  | 'success-stories'
  | 'faculty'
  | 'university'
  | 'school';

const highlight = (text: string, q: string) => {
  if (!text) return '';
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return String(text).replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>');
};

const mapHit = (
  type: string,
  item: any,
  q: string,
  fields: { title: string; excerpt: string; href: string },
) => ({
  id: String(item._id),
  type,
  title: item.title || item.name || item.studentName,
  excerpt: fields.excerpt,
  href: fields.href,
  highlightTitle: highlight(item.title || item.name || item.studentName || '', q),
  highlightExcerpt: highlight(fields.excerpt, q),
  meta: {
    tags: item.tags,
    category: item.category || item.type || item.department,
    company: item.company,
  },
});

export const globalSearch = asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (q.length < 2) throw new AppError('Search query must be at least 2 characters', 422);

  const type = (String(req.query.type || 'all') as SearchType);
  const sort = String(req.query.sort || 'relevance');
  const limit = Math.min(20, Math.max(1, Number(req.query.limit) || 8));
  const sessionId = String(req.headers['x-session-id'] || req.query.sessionId || '');

  const textFilter = { $text: { $search: q } };
  const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

  const runners: Array<Promise<any[]>> = [];

  const want = (t: SearchType) => type === 'all' || type === t;

  if (want('blogs')) {
    runners.push(
      Blog.find({ status: 'published', ...textFilter })
        .select('title slug excerpt tags views publishedAt')
        .limit(limit)
        .lean()
        .then((rows) =>
          rows.map((item) =>
            mapHit('blogs', item, q, {
              title: item.title,
              excerpt: item.excerpt,
              href: `/highlights/blogs/${item.slug}`,
            }),
          ),
        )
        .catch(() =>
          Blog.find({ status: 'published', $or: [{ title: regex }, { excerpt: regex }, { tags: regex }] })
            .select('title slug excerpt tags')
            .limit(limit)
            .lean()
            .then((rows) =>
              rows.map((item) =>
                mapHit('blogs', item, q, {
                  title: item.title,
                  excerpt: item.excerpt,
                  href: `/highlights/blogs/${item.slug}`,
                }),
              ),
            ),
        ),
    );
  }

  if (want('products')) {
    runners.push(
      Product.find({
        status: 'published',
        $or: [{ title: regex }, { description: regex }, { shortDescription: regex }],
      })
        .select('title slug shortDescription')
        .limit(limit)
        .lean()
        .then((rows) =>
          rows.map((item) =>
            mapHit('products', item, q, {
              title: item.title,
              excerpt: item.shortDescription || item.description || '',
              href: `/products/${item.slug}`,
            }),
          ),
        ),
    );
  }

  if (want('careers')) {
    runners.push(
      Career.find({
        status: 'open',
        $or: [{ title: regex }, { description: regex }, { department: regex }, { location: regex }],
      })
        .select('title slug department location type')
        .limit(limit)
        .lean()
        .then((rows) =>
          rows.map((item) =>
            mapHit('careers', item, q, {
              title: item.title,
              excerpt: `${item.department} · ${item.location} · ${item.type}`,
              href: `/careers/${item.slug}`,
            }),
          ),
        ),
    );
  }

  if (want('case-studies')) {
    runners.push(
      CaseStudy.find({
        status: 'published',
        $or: [{ title: regex }, { challenge: regex }, { solution: regex }, { industry: regex }],
      })
        .select('title slug industry client challenge')
        .limit(limit)
        .lean()
        .then((rows) =>
          rows.map((item) =>
            mapHit('case-studies', item, q, {
              title: item.title,
              excerpt: item.challenge || `${item.client} · ${item.industry}`,
              href: `/highlights/case-studies/${item.slug}`,
            }),
          ),
        ),
    );
  }

  if (want('resources')) {
    runners.push(
      Resource.find({
        status: 'published',
        $or: [{ title: regex }, { description: regex }, { tags: regex }],
      })
        .select('title slug description category')
        .limit(limit)
        .lean()
        .then((rows) =>
          rows.map((item) =>
            mapHit('resources', item, q, {
              title: item.title,
              excerpt: item.description,
              href: `/resources/${item.slug}`,
            }),
          ),
        ),
    );
  }

  if (want('events')) {
    runners.push(
      Event.find({
        status: 'published',
        $or: [{ title: regex }, { description: regex }, { location: regex }],
      })
        .select('title slug description type startsAt')
        .limit(limit)
        .lean()
        .then((rows) =>
          rows.map((item) =>
            mapHit('events', item, q, {
              title: item.title,
              excerpt: item.description.slice(0, 160),
              href: `/events/${item.slug}`,
            }),
          ),
        ),
    );
  }

  if (want('success-stories') || want('university') || want('school')) {
    runners.push(
      SuccessStory.find({
        status: 'published',
        $or: [{ title: regex }, { story: regex }, { company: regex }, { program: regex }],
      })
        .select('title slug studentName company role program')
        .limit(limit)
        .lean()
        .then((rows) =>
          rows.map((item) =>
            mapHit('success-stories', item, q, {
              title: item.title,
              excerpt: `${item.studentName} · ${item.role} at ${item.company}`,
              href: `/success-stories/${item.slug}`,
            }),
          ),
        ),
    );
  }

  if (want('faculty') || want('university') || want('school')) {
    runners.push(
      Faculty.find({
        status: 'published',
        $or: [{ name: regex }, { title: regex }, { bio: regex }, { expertise: regex }],
      })
        .select('name slug title type expertise')
        .limit(limit)
        .lean()
        .then((rows) =>
          rows.map((item) =>
            mapHit('faculty', item, q, {
              title: item.name,
              excerpt: `${item.title} · ${(item.expertise || []).slice(0, 3).join(', ')}`,
              href: `/faculty/${item.slug}`,
            }),
          ),
        ),
    );
  }

  // Static engagement solution pages (content lives in frontend routes)
  const engagementHits = [
    {
      type: 'university',
      title: 'University Solutions',
      excerpt: 'Curriculum modernization, CoEs, and industry-integrated learning programs.',
      href: '/engagements/university',
    },
    {
      type: 'school',
      title: 'School Solutions',
      excerpt: 'ICT integration, STEM labs, and tomorrow’s classroom experiences.',
      href: '/engagements/school',
    },
  ]
    .filter((item) => want(item.type as SearchType) || type === 'all')
    .filter((item) => regex.test(item.title) || regex.test(item.excerpt))
    .map((item) => ({
      id: item.href,
      type: item.type,
      title: item.title,
      excerpt: item.excerpt,
      href: item.href,
      highlightTitle: highlight(item.title, q),
      highlightExcerpt: highlight(item.excerpt, q),
      meta: {},
    }));

  const groups = await Promise.all(runners);
  let results = [...groups.flat(), ...engagementHits];

  if (sort === 'newest') {
    // already limited per collection; keep insertion order
  } else if (sort === 'title') {
    results = results.sort((a, b) => String(a.title).localeCompare(String(b.title)));
  }

  await SearchHistory.create({
    query: q,
    sessionId: sessionId || undefined,
    resultCount: results.length,
    filters: { type, sort },
  });

  void AnalyticsEvent.create({
    name: 'search',
    path: '/search',
    meta: { q, type, count: results.length },
    sessionId: sessionId || undefined,
    userAgent: req.get('user-agent') || undefined,
  }).catch(() => undefined);

  return successResponse(res, {
    query: q,
    type,
    sort,
    count: results.length,
    results,
  });
});

export const searchSuggestions = asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').trim();
  const sessionId = String(req.headers['x-session-id'] || req.query.sessionId || '');

  const recent = sessionId
    ? await SearchHistory.find({ sessionId }).sort('-createdAt').limit(8).lean()
    : [];

  const popular = await SearchHistory.aggregate([
    { $group: { _id: { $toLower: '$query' }, count: { $sum: 1 }, query: { $first: '$query' } } },
    { $sort: { count: -1 } },
    { $limit: 8 },
  ]);

  let suggestions: string[] = [];
  if (q.length >= 1) {
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const [blogs, products, careers] = await Promise.all([
      Blog.find({ status: 'published', title: regex }).select('title').limit(5).lean(),
      Product.find({ status: 'published', title: regex }).select('title').limit(5).lean(),
      Career.find({ status: 'open', title: regex }).select('title').limit(5).lean(),
    ]);
    suggestions = [...blogs, ...products, ...careers].map((item) => item.title);
  }

  return successResponse(res, {
    suggestions: Array.from(new Set(suggestions)).slice(0, 8),
    recent: recent.map((item) => item.query),
    popular: popular.map((item) => item.query),
  });
});
