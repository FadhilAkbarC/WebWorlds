import mongoose, { Document } from 'mongoose';
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
export declare const Game: mongoose.Model<IGame, {}, {}, {}, mongoose.Document<unknown, {}, IGame> & IGame & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=Game.d.ts.map