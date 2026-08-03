import { Document, Schema, model } from 'mongoose';

export interface IContact extends Document {
  name: string; email: string; phone?: string; subject: string; message: string;
  status: 'new' | 'read' | 'replied'; repliedAt?: Date;
}

const schema = new Schema<IContact>({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, trim: true, maxlength: 30 },
  subject: { type: String, required: true, trim: true, maxlength: 200 },
  message: { type: String, required: true, maxlength: 5000 },
  status: { type: String, enum: ['new', 'read', 'replied'], default: 'new', index: true },
  repliedAt: Date,
}, { timestamps: true });

schema.index({ name: 'text', email: 'text', subject: 'text', message: 'text' });
export default model<IContact>('Contact', schema);
