import { Document, Schema, model } from 'mongoose';

export interface IFaculty extends Document {
  name: string;
  slug: string;
  title: string;
  type: 'faculty' | 'industry-expert';
  bio: string;
  photoUrl?: string;
  expertise: string[];
  experienceYears: number;
  skills: string[];
  linkedinUrl?: string;
  order: number;
  status: 'draft' | 'published';
}

const schema = new Schema<IFaculty>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ['faculty', 'industry-expert'], default: 'faculty', index: true },
    bio: { type: String, required: true },
    photoUrl: String,
    expertise: [{ type: String, trim: true }],
    experienceYears: { type: Number, default: 0, min: 0 },
    skills: [{ type: String, trim: true }],
    linkedinUrl: String,
    order: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
  },
  { timestamps: true },
);

schema.index({ name: 'text', title: 'text', bio: 'text', expertise: 'text', skills: 'text' });
export default model<IFaculty>('Faculty', schema);
