import User from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { successResponse } from '../utils/apiResponse';
import { asyncHandler, crudController } from '../utils/crud';

const crud = crudController(User, {
  searchFields: ['name', 'email'],
  filterFields: ['role', 'isVerified'],
});

export const getUsers = crud.list;
export const getUser = crud.get;
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', 404);
  if (req.user?.role !== 'super_admin' && (user.role === 'super_admin' || req.body.role === 'super_admin')) {
    throw new AppError('Only a super administrator can manage that role', 403);
  }
  for (const field of ['name', 'email', 'role', 'isVerified', 'avatar']) {
    if (req.body[field] !== undefined) user.set(field, req.body[field]);
  }
  await user.save();
  return successResponse(res, user, 'User updated');
});
export const deleteUser = asyncHandler(async (req, res) => {
  if (String(req.user?._id) === req.params.id) throw new AppError('You cannot delete your own account', 400);
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', 404);
  if (user.role === 'super_admin' && req.user?.role !== 'super_admin') throw new AppError('Forbidden', 403);
  await user.deleteOne();
  return successResponse(res, null, 'User deleted');
});
