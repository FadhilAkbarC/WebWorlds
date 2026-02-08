import mongoose, { Document } from 'mongoose';
export interface IGameSession extends Document {
    game: mongoose.Types.ObjectId;
    player: mongoose.Types.ObjectId;
    startTime: Date;
    endTime?: Date;
    duration: number;
    score?: number;
    createdAt: Date;
}
export declare const GameSession: mongoose.Model<IGameSession, {}, {}, {}, mongoose.Document<unknown, {}, IGameSession> & IGameSession & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=GameSession.d.ts.map