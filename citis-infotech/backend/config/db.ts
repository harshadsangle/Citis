import mongoose from 'mongoose';

export const connectDB = async (): Promise<typeof mongoose> => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is required');
  mongoose.set('strictQuery', true);
  return mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
};

export const disconnectDB = (): Promise<void> => mongoose.disconnect();
