import { Document, Schema, model } from 'mongoose';

/** Persisted search history for suggestions (anonymous session or user). */
export interface ISearchHistory extends Document {
  query: string;
  sessionId?: string;
  userId?: string;
  resultCount: number;
  filters?: Record<string, unknown>;
}

const schema = new Schema<ISearchHistory>(
  {
    query: { type: String, required: true, trim: true, maxlength: 200, index: true },
    sessionId: { type: String, index: true },
    userId: { type: String, index: true },
    resultCount: { type: Number, default: 0 },
    filters: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

schema.index({ query: 'text' });
export default model<ISearchHistory>('SearchHistory', schema);
