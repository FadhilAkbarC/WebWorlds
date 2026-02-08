import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  bio?: string;
  avatar?: string;
  createdGames: mongoose.Types.ObjectId[];
  likedGames: mongoose.Types.ObjectId[];
  followers: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
  stats: {
    gamesCreated: number;
    gamesPlayed: number;
    followers: number;
    totalPlaytime: number;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(plainPassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      lowercase: true,
      match: [/^[a-z0-9_-]+$/, 'Username can only contain lowercase letters, numbers, _, and -'],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/.+\@.+\..+/, 'Invalid email format'],
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // Never return by default
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    avatar: String,
    createdGames: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Game',
      },
    ],
    likedGames: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Game',
      },
    ],
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    stats: {
      gamesCreated: { type: Number, default: 0 },
      gamesPlayed: { type: Number, default: 0 },
      followers: { type: Number, default: 0 },
      totalPlaytime: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Pre-save hook: hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method: compare password
userSchema.methods.comparePassword = async function (plainPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ 'stats.gamesPlayed': -1 });

export const User = mongoose.model<IUser>('User', userSchema);
