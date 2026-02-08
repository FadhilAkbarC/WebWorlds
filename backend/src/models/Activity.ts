import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity extends Document {
  user: mongoose.Types.ObjectId;
  type: 'play' | 'like' | 'unlike' | 'comment' | 'create_game' | 'delete_game';
  targetId?: mongoose.Types.ObjectId;
  targetType?: string;
  meta?: Record<string, any>;
  createdAt: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    targetId: { type: Schema.Types.ObjectId },
    targetType: { type: String },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

// Query recent activities by user quickly
activitySchema.index({ user: 1, createdAt: -1 });

export const Activity = mongoose.model<IActivity>('Activity', activitySchema);
