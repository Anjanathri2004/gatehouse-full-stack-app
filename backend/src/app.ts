import cors from 'cors';
import express, { NextFunction, Request, RequestHandler, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from './config';
import { AuthedRequest, artificialDelay, requireAuth, requireRole } from './middleware';
import { Role, UserEntity, toPublic } from './models';
import { hashPassword, verifyPassword } from './password';
import { Store } from './stores/store';

const ROLES: Role[] = ['General User', 'Admin'];
const USER_ID = /^[a-z0-9_.-]{3,30}$/;

/** Wraps an async handler so rejected promises reach the error middleware. */
const route = (fn: (req: AuthedRequest, res: Response) => Promise<unknown> | unknown): RequestHandler =>
  (req, res, next) => { Promise.resolve(fn(req as AuthedRequest, res)).catch(next); };

/** Builds the Express app around a Store (injected so tests can use their own). */
export function createApp(store: Store) {
  const app = express();
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());
  app.get('/api/health', (_req, res) => res.json({ status: 'ok', store: config.store }));
  app.use('/api', artificialDelay);

  // ---------- Auth ----------
  app.post('/api/auth/login', route(async (req, res) => {
    const { userId, password, role } = req.body || {};
    const user = await store.findUser(String(userId || '').trim().toLowerCase());
    if (!user || !(await verifyPassword(String(password || ''), user.passwordHash))) {
      return res.status(401).json({ message: 'User ID or password is incorrect.' });
    }
    if (user.role !== role) {
      return res.status(403).json({ message: `This account is not registered as "${role}".` });
    }
    if (!user.active) {
      return res.status(403).json({ message: 'This account has been deactivated. Contact an admin.' });
    }
    const token = jwt.sign({ userId: user.userId, role: user.role }, config.jwtSecret, { expiresIn: '2h' });
    res.json({ token, user: toPublic(user) });
  }));

  // ---------- Current user + records ----------
  app.get('/api/me', requireAuth, route(async (req, res) => {
    const user = await store.findUser(req.auth!.userId);
    user ? res.json(toPublic(user)) : res.status(404).json({ message: 'User not found.' });
  }));

  /** Admin sees public + general + admin records; General User sees public + general. */
  app.get('/api/records', requireAuth, route(async (req, res) => {
    const all = await store.listRecords();
    const allowed = req.auth!.role === 'Admin' ? ['public', 'general', 'admin'] : ['public', 'general'];
    const items = all.filter(r => allowed.includes(r.access));
    res.json({ items, visible: items.length, total: all.length, accessLevels: allowed });
  }));

  // ---------- Admin: user management ----------
  const admin = [requireAuth, requireRole('Admin')];

  app.get('/api/users', admin, route(async (_req, res) => {
    res.json((await store.listUsers()).map(toPublic));
  }));

  app.get('/api/users/:userId', admin, route(async (req, res) => {
    const user = await store.findUser(req.params.userId.toLowerCase());
    user ? res.json(toPublic(user)) : res.status(404).json({ message: 'User not found.' });
  }));

  app.post('/api/users', admin, route(async (req, res) => {
    const body = req.body || {};
    const userId = String(body.userId || '').trim().toLowerCase();
    if (!USER_ID.test(userId)) {
      return res.status(400).json({ message: 'User ID must be 3-30 characters: letters, numbers, dot, dash or underscore.' });
    }
    if (!body.name || !ROLES.includes(body.role)) {
      return res.status(400).json({ message: 'Name and a valid role are required.' });
    }
    if (String(body.password || '').length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }
    if (await store.findUser(userId)) {
      return res.status(409).json({ message: `User ID "${userId}" is already taken.` });
    }
    const user: UserEntity = {
      userId, name: body.name, role: body.role, email: body.email || `${userId}@gatehouse.dev`,
      department: body.department || 'General', active: true,
      passwordHash: await hashPassword(body.password), createdAt: new Date().toISOString()
    };
    await store.addUser(user);
    res.status(201).json(toPublic(user));
  }));

  app.put('/api/users/:userId', admin, route(async (req, res) => {
    const userId = req.params.userId.toLowerCase();
    const { name, email, role, department, active, password } = req.body || {};
    if (role !== undefined && !ROLES.includes(role)) { return res.status(400).json({ message: 'Invalid role.' }); }
    if (userId === req.auth!.userId && (active === false || (role && role !== 'Admin'))) {
      return res.status(400).json({ message: 'You cannot deactivate or demote your own account.' });
    }
    const patch: Partial<UserEntity> = {};
    if (name !== undefined) { patch.name = name; }
    if (email !== undefined) { patch.email = email; }
    if (role !== undefined) { patch.role = role; }
    if (department !== undefined) { patch.department = department; }
    if (typeof active === 'boolean') { patch.active = active; }
    if (password) {
      if (String(password).length < 6) { return res.status(400).json({ message: 'Password must be at least 6 characters.' }); }
      patch.passwordHash = await hashPassword(password);
    }
    const updated = await store.updateUser(userId, patch);
    updated ? res.json(toPublic(updated)) : res.status(404).json({ message: 'User not found.' });
  }));

  app.delete('/api/users/:userId', admin, route(async (req, res) => {
    const userId = req.params.userId.toLowerCase();
    if (userId === req.auth!.userId) {
      return res.status(400).json({ message: 'You cannot delete the account you are signed in with.' });
    }
    (await store.deleteUser(userId)) ? res.status(204).end() : res.status(404).json({ message: 'User not found.' });
  }));

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ message: 'Unexpected server error.' });
  });

  return app;
}
