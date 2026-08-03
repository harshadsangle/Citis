import { NextFunction, Request, Response } from 'express';
import { Model } from 'mongoose';
import { AppError } from '../middleware/errorHandler';
import { successResponse } from './apiResponse';
import slugify from './slugify';

type Options = {
  searchFields?: string[];
  filterFields?: string[];
  populate?: string | string[];
  sort?: string;
  allowedFields?: string[];
  slug?: boolean;
  baseFilter?: (req: Request) => Record<string, unknown>;
};

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const bodyFrom = (body: Record<string, unknown>, allowed?: string[]) => {
  if (!allowed) return body;
  return Object.fromEntries(Object.entries(body).filter(([key]) => allowed.includes(key)));
};

export function crudController(model: Model<any>, options: Options = {}) {
  const list = asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
    const filter: Record<string, any> = { ...(options.baseFilter?.(req) || {}) };
    for (const field of options.filterFields || []) {
      if (!Object.prototype.hasOwnProperty.call(filter, field) && req.query[field] !== undefined) {
        filter[field] = req.query[field];
      }
    }
    if (req.query.search && options.searchFields?.length) {
      const escaped = String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = options.searchFields.map((field) => ({ [field]: { $regex: escaped, $options: 'i' } }));
    }
    let query = model.find(filter).sort(String(req.query.sort || options.sort || '-createdAt'))
      .skip((page - 1) * limit).limit(limit);
    if (options.populate) query = query.populate(options.populate);
    const [items, total] = await Promise.all([query.lean(), model.countDocuments(filter)]);
    return successResponse(res, items, 'Items retrieved', 200, {
      page, limit, total, pages: Math.ceil(total / limit),
    });
  });

  const get = asyncHandler(async (req, res) => {
    let query = model.findOne({ _id: req.params.id, ...(options.baseFilter?.(req) || {}) });
    if (options.populate) query = query.populate(options.populate);
    const item = await query;
    if (!item) throw new AppError('Resource not found', 404);
    return successResponse(res, item);
  });

  const getBySlug = asyncHandler(async (req, res) => {
    let query = model.findOne({ slug: req.params.slug, ...(options.baseFilter?.(req) || {}) });
    if (options.populate) query = query.populate(options.populate);
    const item = await query;
    if (!item) throw new AppError('Resource not found', 404);
    if ('views' in item) await model.updateOne({ _id: item._id }, { $inc: { views: 1 } });
    return successResponse(res, item);
  });

  const create = asyncHandler(async (req, res) => {
    const data = bodyFrom(req.body, options.allowedFields);
    if (options.slug && !data.slug && data.title) data.slug = slugify(String(data.title));
    const item = await model.create(data);
    return successResponse(res, item, 'Resource created', 201);
  });

  const update = asyncHandler(async (req, res) => {
    const data = bodyFrom(req.body, options.allowedFields);
    if (options.slug && data.title && !data.slug) data.slug = slugify(String(data.title));
    if (data.status === 'published' && model.schema.path('publishedAt') && !data.publishedAt) {
      data.publishedAt = new Date();
    }
    const item = await model.findByIdAndUpdate(req.params.id, data, {
      new: true, runValidators: true,
    });
    if (!item) throw new AppError('Resource not found', 404);
    return successResponse(res, item, 'Resource updated');
  });

  const remove = asyncHandler(async (req, res) => {
    const item = await model.findByIdAndDelete(req.params.id);
    if (!item) throw new AppError('Resource not found', 404);
    return successResponse(res, null, 'Resource deleted');
  });

  return { list, get, getBySlug, create, update, remove };
}
