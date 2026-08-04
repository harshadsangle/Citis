import { Document, Schema, model } from 'mongoose';

/** Animated timeline data edited via the custom CMS/admin. */
export interface ITimeline extends Document {
  key: 'company' | 'student' | 'learning' | 'placement';
  title: string;
  description?: string;
  items: Array<{
    year: string;
    title: string;
    description: string;
    icon?: string;
  }>;
  status: 'draft' | 'published';
}

const schema = new Schema<ITimeline>(
  {
    key: {
      type: String,
      enum: ['company', 'student', 'learning', 'placement'],
      required: true,
      unique: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: String,
    items: [
      {
        year: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        icon: String,
      },
    ],
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  },
  { timestamps: true },
);

export default model<ITimeline>('Timeline', schema);
