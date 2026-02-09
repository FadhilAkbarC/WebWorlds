import mongoose, { Schema, Document } from 'mongoose';

export interface IGroup extends Document {
  name: string;
  description?: string;
  icon?: string;
  privacy: 'public' | 'private';
  owner: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  membersCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const groupSchema = new Schema<IGroup>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    icon: String,
    privacy: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    membersCount: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

groupSchema.index({ name: 'text', description: 'text' });
groupSchema.index({ owner: 1 });
groupSchema.index({ members: 1 });
groupSchema.index({ privacy: 1 });
groupSchema.index({ createdAt: -1 });

export const Group = mongoose.model<IGroup>('Group', groupSchema);
