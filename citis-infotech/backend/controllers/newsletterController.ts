import Newsletter from '../models/Newsletter';
import { AppError } from '../middleware/errorHandler';
import { successResponse } from '../utils/apiResponse';
import { asyncHandler, crudController } from '../utils/crud';

const crud = crudController(Newsletter, {
  searchFields: ['email'],
  filterFields: ['isActive'],
  allowedFields: ['isActive'],
});

export const getSubscribers = crud.list;
export const updateSubscriber = crud.update;

export const subscribe = asyncHandler(async (req, res) => {
  const email = String(req.body.email).toLowerCase().trim();
  const subscriber = await Newsletter.findOneAndUpdate(
    { email },
    { $set: { isActive: true, subscribedAt: new Date() } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );
  return successResponse(res, subscriber, 'Subscribed', 201);
});

export const unsubscribe = asyncHandler(async (req, res) => {
  const subscriber = await Newsletter.findOneAndUpdate(
    { email: String(req.body.email).toLowerCase().trim() },
    { isActive: false },
    { new: true },
  );
  if (!subscriber) throw new AppError('Subscriber not found', 404);
  return successResponse(res, null, 'Unsubscribed');
});
