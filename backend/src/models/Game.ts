import mongoose, { Schema, Document } from 'mongoose';

export interface IGame extends Document {
  title: string;
  description: string;
  thumbnail?: string;
  creator: mongoose.Types.ObjectId;
  code: string;
  scripts: Array<{
    id: string;
    name: string;
    code: string;
  }>;
  assets: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
  }>;
  settings: {
    width: number;
    height: number;
    fps: number;
    maxPlayers?: number;
    isMultiplayer: boolean;
  };
  stats: {
    plays: number;
    likes: number;
    averageRating: number;
    totalRatings: number;
  };
  tags: string[];
  category: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const gameSchema = new Schema<IGame>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    thumbnail: String,
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    code: {
      type: String,
      default: '// Game code here',
    },
    scripts: [
      {
        id: String,
        name: String,
        code: String,
      },
    ],
    assets: [
      {
        id: String,
        name: String,
        type: String,
        url: String,
      },
    ],
    settings: {
      width: { type: Number, default: 800 },
      height: { type: Number, default: 600 },
      fps: { type: Number, default: 60 },
      maxPlayers: Number,
      isMultiplayer: { type: Boolean, default: false },
    },
    stats: {
      plays: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
      totalRatings: { type: Number, default: 0 },
    },
    tags: [String],
    category: {
      type: String,
      enum: ['action', 'puzzle', 'adventure', 'sports', 'other'],
      default: 'other',
    },
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes for performance
gameSchema.index({ creator: 1 });
gameSchema.index({ createdAt: -1 });
gameSchema.index({ 'stats.plays': -1 });
gameSchema.index({ 'stats.likes': -1 });
gameSchema.index({ category: 1 });
gameSchema.index({ tags: 1 });
gameSchema.index({ published: 1 });

export const Game = mongoose.model<IGame>('Game', gameSchema);
