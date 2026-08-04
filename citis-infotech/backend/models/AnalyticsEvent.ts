import { Document, Schema, model } from 'mongoose';

/** First-party analytics events — no Google Analytics or external trackers. */
export interface IAnalyticsEvent extends Document {
  name:
    | 'page_view'
    | 'blog_view'
    | 'product_view'
    | 'contact_submit'
    | 'career_apply'
    | 'resource_download'
    | 'search'
    | 'event_register'
    | 'custom';
  path?: string;
  resourceType?: string;
  resourceId?: string;
  meta?: Record<string, unknown>;
  sessionId?: string;
  userAgent?: string;
}

const schema = new Schema<IAnalyticsEvent>(
  {
    name: {
      type: String,
      enum: [
        'page_view',
        'blog_view',
        'product_view',
        'contact_submit',
        'career_apply',
        'resource_download',
        'search',
        'event_register',
        'custom',
      ],
      required: true,
      index: true,
    },
    path: String,
    resourceType: String,
    resourceId: String,
    meta: { type: Schema.Types.Mixed },
    sessionId: { type: String, index: true },
    userAgent: String,
  },
  { timestamps: true },
);

schema.index({ createdAt: -1 });
schema.index({ name: 1, createdAt: -1 });

export default model<IAnalyticsEvent>('AnalyticsEvent', schema);
