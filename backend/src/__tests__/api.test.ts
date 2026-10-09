import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import request from 'supertest';
import { createApp } from '../app';
import { buildSeed } from '../seed-data';
import { JsonStore } from '../stores/json-store';

const file = path.join(os.tmpdir(), `gatehouse-test-${process.pid}.json`);
let app: ReturnType<typeof createApp>;

const login = async (userId: string, password: string, role: string) =>
  request(app).post('/api/auth/login').send({ userId, password, role });
const tokenFor = async (userId: string, password: string, role: string) =>
  (await login(userId, password, role)).body.token as string;

beforeAll(async () => {
  if (fs.existsSync(file)) { fs.unlinkSync(file); }
  const store = new JsonStore(file);
  await store.seedIfEmpty(buildSeed());
  app = createApp(store);
});
afterAll(() => { if (fs.existsSync(file)) { fs.unlinkSync(file); } });

describe('auth', () => {
  it('signs in with correct credentials and role', async () => {
    const res = await login('john', 'User@123', 'General User');
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.passwordHash).toBeUndefined();
  });
  it('rejects a wrong password', async () => {
    expect((await login('john', 'nope', 'General User')).status).toBe(401);
  });
  it('rejects a role the account does not have', async () => {
    expect((await login('john', 'User@123', 'Admin')).status).toBe(403);
  });
  it('requires a token for protected routes', async () => {
    expect((await request(app).get('/api/me')).status).toBe(401);
  });
});

describe('records and access levels', () => {
  it('shows a General User 7 of 10 records and no admin tier', async () => {
    const token = await tokenFor('john', 'User@123', 'General User');
    const res = await request(app).get('/api/records').set('Authorization', `Bearer ${token}`);
    expect(res.body.visible).toBe(7);
    expect(res.body.total).toBe(10);
    expect(res.body.items.some((r: any) => r.access === 'admin')).toBe(false);
  });
  it('shows an Admin all 10 records', async () => {
    const token = await tokenFor('admin', 'Admin@123', 'Admin');
    const res = await request(app).get('/api/records').set('Authorization', `Bearer ${token}`);
    expect(res.body.visible).toBe(10);
  });
});

describe('async delay parameter', () => {
  it('delays the response by roughly the requested time', async () => {
    const token = await tokenFor('john', 'User@123', 'General User');
    const started = Date.now();
    await request(app).get('/api/me?delay=300').set('Authorization', `Bearer ${token}`);
    expect(Date.now() - started).toBeGreaterThanOrEqual(280);
  });
});

describe('admin user management', () => {
  let admin: string;
  beforeAll(async () => { admin = await tokenFor('admin', 'Admin@123', 'Admin'); });
  const auth = (t: string) => ({ Authorization: `Bearer ${t}` });

  it('blocks General Users from the users API', async () => {
    const token = await tokenFor('john', 'User@123', 'General User');
    expect((await request(app).get('/api/users').set(auth(token))).status).toBe(403);
  });
  it('creates, reads, updates and deletes a user', async () => {
    const created = await request(app).post('/api/users').set(auth(admin))
      .send({ userId: 'Priya', name: 'Priya N', role: 'General User', password: 'Secret#1' });
    expect(created.status).toBe(201);
    expect(created.body.userId).toBe('priya');

    expect((await request(app).get('/api/users/priya').set(auth(admin))).body.name).toBe('Priya N');

    const upd = await request(app).put('/api/users/priya').set(auth(admin)).send({ department: 'HR', active: false });
    expect(upd.body.department).toBe('HR');
    expect((await login('priya', 'Secret#1', 'General User')).status).toBe(403);

    expect((await request(app).delete('/api/users/priya').set(auth(admin))).status).toBe(204);
    expect((await request(app).get('/api/users/priya').set(auth(admin))).status).toBe(404);
  });
  it('rejects duplicate IDs, short passwords and bad IDs', async () => {
    const dup = await request(app).post('/api/users').set(auth(admin))
      .send({ userId: 'john', name: 'X', role: 'Admin', password: 'Secret#1' });
    expect(dup.status).toBe(409);
    const short = await request(app).post('/api/users').set(auth(admin))
      .send({ userId: 'newbie', name: 'X', role: 'Admin', password: '123' });
    expect(short.status).toBe(400);
    const bad = await request(app).post('/api/users').set(auth(admin))
      .send({ userId: 'a b', name: 'X', role: 'Admin', password: 'Secret#1' });
    expect(bad.status).toBe(400);
  });
  it('stops an admin deleting or demoting themselves', async () => {
    expect((await request(app).delete('/api/users/admin').set(auth(admin))).status).toBe(400);
    const demote = await request(app).put('/api/users/admin').set(auth(admin)).send({ role: 'General User' });
    expect(demote.status).toBe(400);
  });
});
