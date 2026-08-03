import Product from '../models/Product';
import { crudController } from '../utils/crud';

const crud = crudController(Product, {
  searchFields: ['title', 'description', 'shortDescription'],
  filterFields: ['category', 'status'],
  populate: 'category',
  sort: 'order -createdAt',
  slug: true,
  baseFilter: (req) => req.user && ['super_admin', 'admin', 'content_editor'].includes(req.user.role)
    ? {} : { status: 'published' },
  allowedFields: ['title', 'slug', 'description', 'shortDescription', 'features', 'benefits',
    'learningOutcomes', 'curriculum', 'coverImage', 'gallery', 'category', 'status', 'order'],
});

export const getProducts = crud.list;
export const getProduct = crud.get;
export const getProductBySlug = crud.getBySlug;
export const createProduct = crud.create;
export const updateProduct = crud.update;
export const deleteProduct = crud.remove;
