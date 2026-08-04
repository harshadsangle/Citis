import Comment from '../models/Comment';
import { AppError } from '../middleware/errorHandler';
import { notifyAdmins, logActivity } from '../services/auditService';
import { successResponse } from '../utils/apiResponse';
import { asyncHandler, crudController } from '../utils/crud';

const crud = crudController(Comment, {
  searchFields: ['name', 'email', 'body'],
  filterFields: ['blog', 'status'],
  sort: '-createdAt',
  allowedFields: ['blog', 'name', 'email', 'body', 'status', 'parent'],
});

export const listComments = crud.list;
export const getComment = crud.get;
export const updateComment = crud.update;
export const deleteComment = crud.remove;

export const listApprovedByBlog = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ blog: req.params.blogId, status: 'approved' })
    .sort('createdAt')
    .lean();
  return successResponse(res, comments);
});

export const createComment = asyncHandler(async (req, res) => {
  const comment = await Comment.create({
    blog: req.body.blog || req.params.blogId,
    name: req.body.name,
    email: String(req.body.email).toLowerCase().trim(),
    body: req.body.body,
    parent: req.body.parent,
    status: 'pending',
  });
  void notifyAdmins({
    title: 'New blog comment',
    message: `${comment.name} submitted a comment awaiting moderation.`,
    type: 'info',
    link: '/admin/blogs',
  });
  return successResponse(res, comment, 'Comment submitted for moderation', 201);
});

export const moderateComment = asyncHandler(async (req, res) => {
  const status = req.body.status;
  if (!['approved', 'rejected', 'pending'].includes(status)) {
    throw new AppError('Invalid moderation status', 422);
  }
  const comment = await Comment.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true },
  );
  if (!comment) throw new AppError('Comment not found', 404);
  void logActivity(req, {
    action: 'moderate',
    resourceType: 'comment',
    resourceId: String(comment._id),
    summary: `Comment marked ${status}`,
  });
  return successResponse(res, comment, 'Comment updated');
});
