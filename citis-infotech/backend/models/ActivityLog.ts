import { Document, Schema, Types, model } from 'mongoose';

/** Admin activity audit trail. */
export interface IActivityLog extends Document {
  actor?: Types.ObjectId;
  actorEmail?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  summary: string;
  meta?: Record<string, unknown>;
  ip?: string;
}

const schema = new Schema<IActivityLog>(
  {
    actor: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    actorEmail: String,
    action: { type: String, required: true, index: true },
    resourceType: { type: String, required: true, index: true },
    resourceId: String,
    summary: { type: String, required: true },
    meta: { type: Schema.Types.Mixed },
    ip: String,
  },
  { timestamps: true },
);

schema.index({ createdAt: -1 });
export default model<IActivityLog>('ActivityLog', schema);
