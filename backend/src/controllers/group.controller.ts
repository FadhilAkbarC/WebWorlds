import { Response } from 'express';
import mongoose from 'mongoose';
import { Group } from '../models';
import { AppError, asyncHandler } from '../middleware/error-handler';
import { validators } from '../middleware/validation';
import { AuthRequest } from '../middleware/auth';
import { successResponse } from '../utils/response';

const normalizeBody = (body: any) =>
  typeof body === 'string'
    ? (() => {
        try {
          return JSON.parse(body);
        } catch {
          return {};
        }
      })()
    : body || {};

export const groupController = {
  /**
   * List groups with pagination and search
   */
  list: asyncHandler(async (req: AuthRequest, res: Response) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 24));
    const search = (req.query.search as string)?.trim() || '';

    const visibilityFilter = req.userId
      ? {
          $or: [
            { privacy: 'public' },
            { owner: new mongoose.Types.ObjectId(req.userId) },
            { members: new mongoose.Types.ObjectId(req.userId) },
          ],
        }
      : { privacy: 'public' };

    const searchFilter = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
          ],
        }
      : null;

    const query = searchFilter ? { $and: [visibilityFilter, searchFilter] } : visibilityFilter;

    const total = await Group.countDocuments(query);
    const pages = Math.max(1, Math.ceil(total / limit));

    const groups = await Group.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('name description icon privacy owner members membersCount createdAt')
      .lean();

    const userId = req.userId ? String(req.userId) : null;
    const withFlags = groups.map((group: any) => ({
      ...group,
      isOwner: userId ? String(group.owner) === userId : false,
      isMember: userId
        ? String(group.owner) === userId ||
          (group.members || []).some((member: any) => String(member) === userId)
        : false,
      members: undefined,
    }));

    res.json(
      successResponse(withFlags, {
        page,
        limit,
        total,
        pages,
      })
    );
  }),

  /**
   * Get group by ID
   */
  get: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError(400, 'Invalid group id');
    }

    const group = await Group.findById(id).lean();
    if (!group) {
      throw new AppError(404, 'Group not found');
    }

    const userId = req.userId ? String(req.userId) : null;
    const isMember = userId
      ? String(group.owner) === userId ||
        (group.members || []).some((member: any) => String(member) === userId)
      : false;

    if (group.privacy === 'private' && !isMember) {
      throw new AppError(403, 'Group is private');
    }

    res.json(
      successResponse({
        ...group,
        isOwner: userId ? String(group.owner) === userId : false,
        isMember,
        members: undefined,
      })
    );
  }),

  /**
   * Create a new group
   */
  create: asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      throw new AppError(401, 'Not authenticated');
    }

    const body = normalizeBody(req.body);
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const description = typeof body.description === 'string' ? body.description.trim() : '';
    const privacy = typeof body.privacy === 'string' ? body.privacy.trim().toLowerCase() : 'public';
    const icon = typeof body.icon === 'string' ? body.icon.trim() : '';

    if (!name) {
      throw new AppError(400, 'Group name is required');
    }
    if (!validators.title(name)) {
      throw new AppError(400, 'Group name must be 3-100 characters');
    }
    if (description && !validators.description(description)) {
      throw new AppError(400, 'Description max 1000 characters');
    }
    if (privacy !== 'public' && privacy !== 'private') {
      throw new AppError(400, 'Invalid privacy setting');
    }
    if (icon) {
      const isDataUrl = icon.startsWith('data:image/');
      if (!isDataUrl && !validators.url(icon)) {
        throw new AppError(400, 'Invalid icon URL');
      }
    }

    const group = new Group({
      name,
      description,
      privacy,
      icon: icon || undefined,
      owner: req.userId,
      members: [req.userId],
      membersCount: 1,
    });

    await group.save();

    res.status(201).json(successResponse(group));
  }),

  /**
   * Join a group
   */
  join: asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      throw new AppError(401, 'Not authenticated');
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError(400, 'Invalid group id');
    }

    const group = await Group.findById(id);
    if (!group) {
      throw new AppError(404, 'Group not found');
    }
    if (group.privacy === 'private') {
      throw new AppError(403, 'Group is private');
    }

    const alreadyMember = group.members.some(
      (member) => String(member) === String(req.userId)
    );
    if (!alreadyMember) {
      group.members.push(new mongoose.Types.ObjectId(req.userId));
      group.membersCount = Math.max(1, group.membersCount + 1);
      await group.save();
    }

    res.json(successResponse({ joined: true }));
  }),

  /**
   * Leave a group
   */
  leave: asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      throw new AppError(401, 'Not authenticated');
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError(400, 'Invalid group id');
    }

    const group = await Group.findById(id);
    if (!group) {
      throw new AppError(404, 'Group not found');
    }

    const beforeCount = group.members.length;
    group.members = group.members.filter(
      (member) => String(member) !== String(req.userId)
    );
    if (group.members.length !== beforeCount) {
      group.membersCount = Math.max(0, group.membersCount - 1);
      await group.save();
    }

    res.json(successResponse({ left: true }));
  }),

  /**
   * Get groups for the authenticated user
   */
  mine: asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      throw new AppError(401, 'Not authenticated');
    }

    const groups = await Group.find({
      $or: [{ owner: req.userId }, { members: req.userId }],
    })
      .sort({ createdAt: -1 })
      .select('name description icon privacy owner membersCount createdAt')
      .lean();

    res.json(successResponse(groups));
  }),
};

export default groupController;
