import { Document, Schema, model } from 'mongoose';

export interface ITestimonial extends Document {
  name: string; role: string; company?: string; content: string; avatar?: string;
  rating: number; featured: boolean; order: number;
}

const schema = new Schema<ITestimonial>({
  name: { type: String, required: true, trim: true },
  role: { type: String, required: true, trim: true },
  company: { type: String, trim: true },
  content: { type: String, required: true, maxlength: 2000 },
  avatar: String,
  rating: { type: Number, min: 1, max: 5, default: 5 },
  featured: { type: Boolean, default: false, index: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default model<ITestimonial>('Testimonial', schema);
