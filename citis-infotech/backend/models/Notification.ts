import { Document, Schema, Types, model } from 'mongoose';

export interface INotification extends Document {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'application' | 'system';
  audience: 'admin' | 'user' | 'all';
  user?: Types.ObjectId;
  link?: string;
  read: boolean;
  meta?: Record<string, unknown>;
}

const schema = new Schema<INotification>(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    message: { type: String, required: true, maxlength: 1000 },
    type: {
      type: String,
      enum: ['info', 'success', 'warning', 'error', 'application', 'system'],
      default: 'info',
      index: true,
    },
    audience: { type: String, enum: ['admin', 'user', 'all'], default: 'admin', index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    link: String,
    read: { type: Boolean, default: false, index: true },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

export default model<INotification>('Notification', schema);
