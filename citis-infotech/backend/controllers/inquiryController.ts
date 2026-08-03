import Inquiry from '../models/Inquiry';
import { successResponse } from '../utils/apiResponse';
import { asyncHandler, crudController } from '../utils/crud';

const crud = crudController(Inquiry, {
  searchFields: ['name', 'email', 'organization', 'message'],
  filterFields: ['status', 'partnershipType'],
  allowedFields: ['status'],
});

export const getInquiries = crud.list;
export const updateInquiry = crud.update;

export const createInquiry = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.create({
    name: req.body.name, email: req.body.email, phone: req.body.phone,
    organization: req.body.organization, partnershipType: req.body.partnershipType,
    message: req.body.message,
  });
  return successResponse(res, inquiry, 'Inquiry submitted', 201);
});
