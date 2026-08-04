import { Document, Schema, model } from 'mongoose';

/**
 * In-house CMS sections — administrators edit site content without source changes.
 * Keys map to homepage/about/footer blocks.
 */
export interface ICmsSection extends Document {
  key: string;
  page: 'home' | 'about' | 'products' | 'footer' | 'global';
  title: string;
  content: Record<string, unknown>;
  status: 'draft' | 'published';
  updatedBy?: string;
}

const schema = new Schema<ICmsSection>(
  {
    key: { type: String, required: true, unique: true, lowercase: true, index: true },
    page: {
      type: String,
      enum: ['home', 'about', 'products', 'footer', 'global'],
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    content: { type: Schema.Types.Mixed, required: true, default: {} },
    status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
    updatedBy: String,
  },
  { timestamps: true },
);

export default model<ICmsSection>('CmsSection', schema);
