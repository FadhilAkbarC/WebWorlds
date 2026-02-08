import mongoose, { Document } from 'mongoose';
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
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser> & IUser & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=User.d.ts.map