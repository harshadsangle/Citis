import { Document, Schema, model } from 'mongoose';

/** Downloadable resources — files stored on local disk via Multer. */
export interface IResource extends Document {
  title: string;
  slug: string;
  description: string;
  category: 'pdf' | 'brochure' | 'company-profile' | 'whitepaper' | 'other';
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  downloads: number;
  status: 'draft' | 'published';
  tags: string[];
}

const schema = new Schema<IResource>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, required: true, maxlength: 1000 },
    category: {
      type: String,
      enum: ['pdf', 'brochure', 'company-profile', 'whitepaper', 'other'],
      default: 'pdf',
      index: true,
    },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number, default: 0 },
    mimeType: { type: String, default: 'application/pdf' },
    downloads: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
    tags: [{ type: String, trim: true, lowercase: true }],
  },
  { timestamps: true },
);

schema.index({ title: 'text', description: 'text', tags: 'text' });
export default model<IResource>('Resource', schema);
