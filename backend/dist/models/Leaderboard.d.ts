import mongoose, { Document } from 'mongoose';
export interface ILeaderboardEntry extends Document {
    game: mongoose.Types.ObjectId;
    player: mongoose.Types.ObjectId;
    score: number;
    rank: number;
    updatedAt: Date;
}
export declare const Leaderboard: mongoose.Model<ILeaderboardEntry, {}, {}, {}, mongoose.Document<unknown, {}, ILeaderboardEntry> & ILeaderboardEntry & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=Leaderboard.d.ts.map