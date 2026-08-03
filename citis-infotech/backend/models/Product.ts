import { Document, Schema, Types, model } from 'mongoose';

export interface IProduct extends Document {
  title: string; slug: string; description: string; shortDescription: string;
  features: string[]; benefits: string[]; learningOutcomes: string[];
  curriculum: Array<{ title: string; description?: string; duration?: string }>;
  coverImage?: string; gallery: string[]; category: Types.ObjectId;
  status: 'draft' | 'published'; order: number;
}

const schema = new Schema<IProduct>({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  slug: { type: String, required: true, unique: true, lowercase: true, index: true },
  description: { type: String, required: true },
  shortDescription: { type: String, required: true, maxlength: 500 },
  features: [String],
  benefits: [String],
  learningOutcomes: [String],
  curriculum: [{ title: { type: String, required: true }, description: String, duration: String, _id: false }],
  coverImage: String,
  gallery: [String],
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
  status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

schema.index({ title: 'text', description: 'text', shortDescription: 'text' });
export default model<IProduct>('Product', schema);
