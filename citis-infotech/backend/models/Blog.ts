import { Document, Schema, Types, model } from 'mongoose';

export interface IBlog extends Document {
  title: string; slug: string; excerpt: string; content: string; coverImage?: string;
  category: Types.ObjectId; author: Types.ObjectId; tags: string[];
  status: 'draft' | 'published'; publishedAt?: Date;
  seo: { title?: string; description?: string; keywords: string[] }; views: number;
}

const schema = new Schema<IBlog>({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  slug: { type: String, required: true, unique: true, lowercase: true, index: true },
  excerpt: { type: String, required: true, maxlength: 500 },
  content: { type: String, required: true },
  coverImage: String,
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tags: [{ type: String, trim: true, lowercase: true }],
  status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
  publishedAt: Date,
  seo: {
    title: { type: String, maxlength: 70 },
    description: { type: String, maxlength: 170 },
    keywords: [String],
  },
  views: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

schema.index({ title: 'text', excerpt: 'text', content: 'text', tags: 'text' });
schema.pre('save', function () {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) this.publishedAt = new Date();
});
export default model<IBlog>('Blog', schema);
