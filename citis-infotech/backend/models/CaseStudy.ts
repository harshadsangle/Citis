import { Document, Schema, model } from 'mongoose';

export interface ICaseStudy extends Document {
  title: string; slug: string; client: string; industry: string; challenge: string;
  solution: string; results: string[]; coverImage?: string; gallery: string[]; tags: string[];
  featured: boolean; status: 'draft' | 'published'; publishedAt?: Date;
}

const schema = new Schema<ICaseStudy>({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  slug: { type: String, required: true, unique: true, lowercase: true, index: true },
  client: { type: String, required: true, trim: true },
  industry: { type: String, required: true, trim: true, index: true },
  challenge: { type: String, required: true },
  solution: { type: String, required: true },
  results: [String],
  coverImage: String,
  gallery: [String],
  tags: [{ type: String, trim: true, lowercase: true }],
  featured: { type: Boolean, default: false, index: true },
  status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
  publishedAt: Date,
}, { timestamps: true });

schema.index({ title: 'text', client: 'text', industry: 'text', challenge: 'text', solution: 'text' });
schema.pre('save', function () {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) this.publishedAt = new Date();
});
export default model<ICaseStudy>('CaseStudy', schema);
