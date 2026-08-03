import { Document, Schema, model } from 'mongoose';

export interface IInquiry extends Document {
  name: string; email: string; phone?: string; organization?: string;
  partnershipType: string; message: string; status: 'new' | 'read' | 'replied';
}

const schema = new Schema<IInquiry>({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, trim: true, maxlength: 30 },
  organization: { type: String, trim: true, maxlength: 200 },
  partnershipType: { type: String, required: true, trim: true, maxlength: 100 },
  message: { type: String, required: true, maxlength: 5000 },
  status: { type: String, enum: ['new', 'read', 'replied'], default: 'new', index: true },
}, { timestamps: true });

schema.index({ name: 'text', email: 'text', organization: 'text', message: 'text' });
export default model<IInquiry>('Inquiry', schema);
