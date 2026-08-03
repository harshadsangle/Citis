import { Document, Schema, model } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  type: 'blog' | 'product' | 'career';
}

const schema = new Schema<ICategory>({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  slug: { type: String, required: true, lowercase: true, trim: true },
  description: { type: String, maxlength: 1000 },
  type: { type: String, enum: ['blog', 'product', 'career'], required: true },
}, { timestamps: true });

schema.index({ slug: 1, type: 1 }, { unique: true });
export default model<ICategory>('Category', schema);
