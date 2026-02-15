import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/error-handler';
import { successResponse } from '../utils/response';

type BroadcastAlertState = {
  message: string;
  createdAt: string;
} | null;

let refreshAlertState: BroadcastAlertState = null;

export const broadcastAlertController = {
  get: asyncHandler(async (_req: Request, res: Response) => {
    res.json(successResponse(refreshAlertState));
  }),

  set: asyncHandler(async (req: Request, res: Response) => {
    const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';

    if (!message) {
      res.status(400).json({ success: false, error: 'Message is required' });
      return;
    }

    refreshAlertState = {
      message,
      createdAt: new Date().toISOString(),
    };

    res.json(successResponse(refreshAlertState));
  }),

  consume: asyncHandler(async (_req: Request, res: Response) => {
    refreshAlertState = null;
    res.json(successResponse({ cleared: true }));
  }),
};

export default broadcastAlertController;
