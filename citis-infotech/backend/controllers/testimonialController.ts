import Testimonial from '../models/Testimonial';
import { crudController } from '../utils/crud';

const crud = crudController(Testimonial, {
  searchFields: ['name', 'role', 'company', 'content'],
  filterFields: ['featured', 'rating'],
  sort: 'order -createdAt',
  allowedFields: ['name', 'role', 'company', 'content', 'avatar', 'rating', 'featured', 'order'],
});

export const getTestimonials = crud.list;
export const getTestimonial = crud.get;
export const createTestimonial = crud.create;
export const updateTestimonial = crud.update;
export const deleteTestimonial = crud.remove;
