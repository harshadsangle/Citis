import Notification from '../models/Notification';
import ActivityLog from '../models/ActivityLog';
import type { Request } from 'express';

export async function notifyAdmins(input: {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error' | 'application' | 'system';
  link?: string;
  meta?: Record<string, unknown>;
}) {
  return Notification.create({
    title: input.title,
    message: input.message,
    type: input.type || 'info',
    audience: 'admin',
    link: input.link,
    meta: input.meta,
  });
}

export async function logActivity(
  req: Request | null,
  input: {
    action: string;
    resourceType: string;
    resourceId?: string;
    summary: string;
    meta?: Record<string, unknown>;
  },
) {
  return ActivityLog.create({
    actor: req?.user?._id,
    actorEmail: req?.user?.email,
    action: input.action,
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    summary: input.summary,
    meta: input.meta,
    ip: req?.ip,
  });
}
