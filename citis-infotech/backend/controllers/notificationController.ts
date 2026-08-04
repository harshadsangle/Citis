import Notification from '../models/Notification';
import ActivityLog from '../models/ActivityLog';
import { AppError } from '../middleware/errorHandler';
import { successResponse } from '../utils/apiResponse';
import { asyncHandler } from '../utils/crud';

export const listNotifications = asyncHandler(async (req, res) => {
  const filter: Record<string, unknown> = {
    $or: [{ audience: 'admin' }, { audience: 'all' }, { user: req.user?._id }],
  };
  if (req.query.unread === 'true') filter.read = false;
  const items = await Notification.find(filter).sort('-createdAt').limit(50).lean();
  const unread = await Notification.countDocuments({ ...filter, read: false });
  return successResponse(res, { items, unread });
});

export const markRead = asyncHandler(async (req, res) => {
  const item = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
  if (!item) throw new AppError('Notification not found', 404);
  return successResponse(res, item);
});

export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    {
      read: false,
      $or: [{ audience: 'admin' }, { audience: 'all' }, { user: req.user?._id }],
    },
    { read: true },
  );
  return successResponse(res, null, 'All notifications marked read');
});

export const listActivity = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const [items, total] = await Promise.all([
    ActivityLog.find()
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    ActivityLog.countDocuments(),
  ]);
  return successResponse(res, items, 'Activity retrieved', 200, {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  });
});
