import { Document, Schema, model } from 'mongoose';

/** Student / alumni success stories with locally hosted media. */
export interface ISuccessStory extends Document {
  title: string;
  slug: string;
  studentName: string;
  program: string;
  company: string;
  role: string;
  story: string;
  imageUrl?: string;
  videoUrl?: string;
  placementYear?: number;
  tags: string[];
  featured: boolean;
  status: 'draft' | 'published';
  order: number;
}

const schema = new Schema<ISuccessStory>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    studentName: { type: String, required: true, trim: true },
    program: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true, index: true },
    role: { type: String, required: true, trim: true },
    story: { type: String, required: true },
    imageUrl: String,
    videoUrl: String,
    placementYear: Number,
    tags: [{ type: String, trim: true, lowercase: true }],
    featured: { type: Boolean, default: false, index: true },
    status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

schema.index({ title: 'text', studentName: 'text', story: 'text', company: 'text', tags: 'text' });
export default model<ISuccessStory>('SuccessStory', schema);
