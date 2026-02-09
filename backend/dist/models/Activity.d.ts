import mongoose, { Document } from 'mongoose';
export interface IActivity extends Document {
    user: mongoose.Types.ObjectId;
    type: 'play' | 'like' | 'unlike' | 'comment' | 'create_game' | 'delete_game';
    targetId?: mongoose.Types.ObjectId;
    targetType?: string;
    meta?: Record<string, any>;
    createdAt: Date;
}
export declare const Activity: mongoose.Model<IActivity, {}, {}, {}, mongoose.Document<unknown, {}, IActivity> & IActivity & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=Activity.d.ts.map