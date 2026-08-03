import Blog from '../models/Blog';
import { successResponse } from '../utils/apiResponse';
import { asyncHandler, crudController } from '../utils/crud';
import slugify from '../utils/slugify';

const fields = ['title', 'slug', 'excerpt', 'content', 'coverImage', 'category', 'tags', 'status', 'publishedAt', 'seo'];
const crud = crudController(Blog, {
  searchFields: ['title', 'excerpt', 'content', 'tags'],
  filterFields: ['category', 'status', 'author'],
  populate: ['category', 'author'],
  slug: true,
  allowedFields: fields,
  baseFilter: (req) => req.user && ['super_admin', 'admin', 'content_editor'].includes(req.user.role)
    ? {} : { status: 'published' },
});

export const getBlogs = crud.list;
export const getBlog = crud.get;
export const getBlogBySlug = crud.getBySlug;
export const updateBlog = crud.update;
export const deleteBlog = crud.remove;
export const createBlog = asyncHandler(async (req, res) => {
  const data = Object.fromEntries(Object.entries(req.body).filter(([key]) => fields.includes(key)));
  const blog = await Blog.create({
    ...data,
    slug: data.slug ? String(data.slug) : slugify(String(data.title)),
    author: req.user?._id,
  });
  return successResponse(res, blog, 'Blog created', 201);
});
