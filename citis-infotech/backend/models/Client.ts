import { Document, Schema, model } from 'mongoose';

export interface IClient extends Document {
  name: string; logo: string; website?: string; featured: boolean; order: number;
}

const schema = new Schema<IClient>({
  name: { type: String, required: true, trim: true, maxlength: 150 },
  logo: { type: String, required: true },
  website: { type: String, trim: true },
  featured: { type: Boolean, default: false, index: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default model<IClient>('Client', schema);
