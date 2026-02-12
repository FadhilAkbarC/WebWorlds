import { Response } from 'express';
export declare const commentController: {
    getGameComments: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    createComment: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    deleteComment: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    likeComment: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    unlikeComment: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
};
export default commentController;
//# sourceMappingURL=comment.controller.d.ts.map