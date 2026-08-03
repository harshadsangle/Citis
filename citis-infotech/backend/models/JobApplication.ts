import { Document, Schema, Types, model } from 'mongoose';

export interface IJobApplication extends Document {
  career: Types.ObjectId; name: string; email: string; phone?: string; resume: string;
  coverLetter?: string; status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected';
}

const schema = new Schema<IJobApplication>({
  career: { type: Schema.Types.ObjectId, ref: 'Career', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, trim: true, maxlength: 30 },
  resume: { type: String, required: true },
  coverLetter: { type: String, maxlength: 5000 },
  status: { type: String, enum: ['pending', 'reviewed', 'shortlisted', 'rejected'], default: 'pending', index: true },
}, { timestamps: true });

schema.index({ career: 1, email: 1 }, { unique: true });
export default model<IJobApplication>('JobApplication', schema);
