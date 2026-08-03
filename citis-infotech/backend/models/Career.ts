import { Document, Schema, model } from 'mongoose';

export interface ICareer extends Document {
  title: string; slug: string; department: string; location: string;
  type: 'full-time' | 'part-time' | 'internship' | 'contract';
  description: string; requirements: string[]; responsibilities: string[]; benefits: string[];
  salary?: { min?: number; max?: number; currency?: string };
  status: 'open' | 'closed'; applicationsCount: number;
}

const schema = new Schema<ICareer>({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  slug: { type: String, required: true, unique: true, lowercase: true, index: true },
  department: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  type: { type: String, enum: ['full-time', 'part-time', 'internship', 'contract'], required: true },
  description: { type: String, required: true },
  requirements: [String],
  responsibilities: [String],
  benefits: [String],
  salary: { min: { type: Number, min: 0 }, max: { type: Number, min: 0 }, currency: { type: String, default: 'USD' }, _id: false },
  status: { type: String, enum: ['open', 'closed'], default: 'open', index: true },
  applicationsCount: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

schema.index({ title: 'text', department: 'text', location: 'text', description: 'text' });
export default model<ICareer>('Career', schema);
