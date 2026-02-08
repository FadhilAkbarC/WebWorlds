import mongoose, { Schema, Document } from 'mongoose';

export interface ILeaderboardEntry extends Document {
  game: mongoose.Types.ObjectId;
  player: mongoose.Types.ObjectId;
  score: number;
  rank: number;
  updatedAt: Date;
}

const leaderboardSchema = new Schema<ILeaderboardEntry>(
  {
    game: {
      type: Schema.Types.ObjectId,
      ref: 'Game',
      required: true,
    },
    player: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    score: { type: Number, required: true },
    rank: { type: Number, required: true },
  },
  { timestamps: true }
);

// Compound index for faster leaderboard queries
leaderboardSchema.index({ game: 1, rank: 1 });
leaderboardSchema.index({ player: 1, game: 1 }, { unique: true });

export const Leaderboard = mongoose.model<ILeaderboardEntry>(
  'Leaderboard',
  leaderboardSchema
);
