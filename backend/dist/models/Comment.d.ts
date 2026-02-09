import mongoose, { Document } from 'mongoose';
export interface IComment extends Document {
    gameId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    username: string;
    avatar?: string;
    text: string;
    likes: number;
    likedBy: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}
export declare const Comment: mongoose.Model<IComment, {}, {}, {}, mongoose.Document<unknown, {}, IComment> & IComment & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=Comment.d.ts.map