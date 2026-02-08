import mongoose, { Schema, Document } from 'mongoose';

export interface IGameSession extends Document {
  game: mongoose.Types.ObjectId;
  player: mongoose.Types.ObjectId;
  startTime: Date;
  endTime?: Date;
  duration: number;
  score?: number;
  createdAt: Date;
}

const gameSessionSchema = new Schema<IGameSession>(
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
    startTime: {
      type: Date,
      default: () => new Date(),
    },
    endTime: Date,
    duration: { type: Number, default: 0 },
    score: Number,
  },
  { timestamps: true }
);

// Indexes for performance
gameSessionSchema.index({ game: 1, createdAt: -1 });
gameSessionSchema.index({ player: 1, createdAt: -1 });

export const GameSession = mongoose.model<IGameSession>(
  'GameSession',
  gameSessionSchema
);
