import { Document, Schema, Types, model } from 'mongoose';

/** Blog comments stored entirely in MongoDB (no third-party). */
export interface IComment extends Document {
  blog: Types.ObjectId;
  name: string;
  email: string;
  body: string;
  status: 'pending' | 'approved' | 'rejected';
  parent?: Types.ObjectId;
}

const schema = new Schema<IComment>(
  {
    blog: { type: Schema.Types.ObjectId, ref: 'Blog', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, lowercase: true, trim: true },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    parent: { type: Schema.Types.ObjectId, ref: 'Comment' },
  },
  { timestamps: true },
);

export default model<IComment>('Comment', schema);
