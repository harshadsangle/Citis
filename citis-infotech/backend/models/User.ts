import bcrypt from 'bcryptjs';
import { Document, Model, Schema, model } from 'mongoose';

export type UserRole = 'super_admin' | 'admin' | 'content_editor' | 'hr' | 'guest';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  refreshToken?: string;
  avatar?: string;
  createdAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true, minlength: 8, select: false },
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'content_editor', 'hr', 'guest'],
    default: 'guest',
  },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String, select: false },
  resetPasswordToken: { type: String, select: false },
  resetPasswordExpire: { type: Date, select: false },
  refreshToken: { type: String, select: false },
  avatar: String,
  createdAt: { type: Date, default: Date.now },
}, { versionKey: false });

userSchema.pre('save', async function () {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    delete ret.password;
    delete ret.refreshToken;
    delete ret.verificationToken;
    delete ret.resetPasswordToken;
    return ret;
  },
});

const User: Model<IUser> = model<IUser>('User', userSchema);
export default User;
