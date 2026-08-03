import { Document, Schema, model } from 'mongoose';

export interface INewsletter extends Document {
  email: string; isActive: boolean; subscribedAt: Date;
}

const schema = new Schema<INewsletter>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  isActive: { type: Boolean, default: true },
  subscribedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default model<INewsletter>('Newsletter', schema);
