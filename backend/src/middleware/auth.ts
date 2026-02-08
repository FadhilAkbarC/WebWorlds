import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/env';

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

/**
 * JWT Authentication Middleware
 */
export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1]; // Extract Bearer TOKEN

  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as any;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token expired' });
    } else {
      res.status(403).json({ error: 'Invalid token' });
    }
  }
}

/**
 * Generate JWT Token
 */
export function generateToken(userId: string): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options: any = {
    expiresIn: config.JWT_EXPIRY,
  };
  return jwt.sign({ userId }, config.JWT_SECRET, options);
}

/**
 * Optional Authentication (doesn't fail if no token)
 */
export function optionalAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET) as any;
      req.userId = decoded.userId;
    } catch (error) {
      // Silently ignore invalid tokens for optional auth
    }
  }

  next();
}
