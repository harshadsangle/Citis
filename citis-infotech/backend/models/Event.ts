import { Document, Schema, Types, model } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  slug: string;
  type: 'workshop' | 'seminar' | 'conference' | 'training';
  description: string;
  location: string;
  isOnline: boolean;
  startsAt: Date;
  endsAt: Date;
  schedule: Array<{ time: string; title: string; speaker?: string }>;
  capacity: number;
  registeredCount: number;
  coverImage?: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  tags: string[];
}

export interface IEventRegistration extends Document {
  event: Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  status: 'registered' | 'waitlisted' | 'cancelled' | 'attended';
}

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    type: {
      type: String,
      enum: ['workshop', 'seminar', 'conference', 'training'],
      required: true,
      index: true,
    },
    description: { type: String, required: true },
    location: { type: String, required: true, trim: true },
    isOnline: { type: Boolean, default: false },
    startsAt: { type: Date, required: true, index: true },
    endsAt: { type: Date, required: true },
    schedule: [
      {
        time: String,
        title: String,
        speaker: String,
      },
    ],
    capacity: { type: Number, default: 100, min: 1 },
    registeredCount: { type: Number, default: 0, min: 0 },
    coverImage: String,
    status: {
      type: String,
      enum: ['draft', 'published', 'cancelled', 'completed'],
      default: 'draft',
      index: true,
    },
    tags: [{ type: String, trim: true, lowercase: true }],
  },
  { timestamps: true },
);

eventSchema.index({ title: 'text', description: 'text', tags: 'text' });

const registrationSchema = new Schema<IEventRegistration>(
  {
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, maxlength: 30 },
    organization: { type: String, trim: true, maxlength: 200 },
    status: {
      type: String,
      enum: ['registered', 'waitlisted', 'cancelled', 'attended'],
      default: 'registered',
      index: true,
    },
  },
  { timestamps: true },
);

registrationSchema.index({ event: 1, email: 1 }, { unique: true });

export const Event = model<IEvent>('Event', eventSchema);
export const EventRegistration = model<IEventRegistration>('EventRegistration', registrationSchema);
