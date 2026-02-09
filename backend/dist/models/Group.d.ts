import mongoose, { Document } from 'mongoose';
export interface IGroup extends Document {
    name: string;
    description?: string;
    icon?: string;
    privacy: 'public' | 'private';
    owner: mongoose.Types.ObjectId;
    members: mongoose.Types.ObjectId[];
    membersCount: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Group: mongoose.Model<IGroup, {}, {}, {}, mongoose.Document<unknown, {}, IGroup> & IGroup & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=Group.d.ts.map