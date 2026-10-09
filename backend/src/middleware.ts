import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from './config';
import { Role } from './models';

export interface AuthedRequest extends Request { auth?: { userId: string; role: Role }; }

/** Simulates a slow backend: any request accepts ?delay=<ms> (capped at 10s). */
export function artificialDelay(req: Request, _res: Response, next: NextFunction): void {
  const ms = Math.min(Math.max(parseInt(String(req.query.delay), 10) || 0, 0), 10_000);
  ms ? setTimeout(next, ms) : next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  try {
    (req as AuthedRequest).auth = jwt.verify(token, config.jwtSecret) as AuthedRequest['auth'];
    next();
  } catch {
    res.status(401).json({ message: 'Your session has expired. Please sign in again.' });
  }
}

export function requireRole(role: Role) {
  return (req: Request, res: Response, next: NextFunction): void =>
    (req as AuthedRequest).auth?.role === role
      ? next()
      : void res.status(403).json({ message: 'Admin access is required.' });
}
