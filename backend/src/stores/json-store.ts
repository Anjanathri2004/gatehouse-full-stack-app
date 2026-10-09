import * as fs from 'fs';
import * as path from 'path';
import { Database, UserEntity } from '../models';
import { Store } from './store';

/** Zero-setup backend: one JSON file on disk. */
export class JsonStore implements Store {
  private db: Database = { users: [], records: [] };

  constructor(private readonly file: string) {
    if (fs.existsSync(file)) { this.db = JSON.parse(fs.readFileSync(file, 'utf8')); }
  }

  private persist(): void {
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    fs.writeFileSync(this.file, JSON.stringify(this.db, null, 2));
  }

  async init(): Promise<void> {}
  async close(): Promise<void> {}

  async seedIfEmpty(data: Database): Promise<void> {
    if (this.db.users.length === 0) { this.db = data; this.persist(); }
  }
  async findUser(userId: string) { return this.db.users.find(u => u.userId === userId); }
  async listUsers() { return [...this.db.users]; }
  async addUser(user: UserEntity) { this.db.users.push(user); this.persist(); }
  async updateUser(userId: string, patch: Partial<UserEntity>) {
    const u = await this.findUser(userId);
    if (!u) { return undefined; }
    Object.assign(u, patch);
    this.persist();
    return u;
  }
  async deleteUser(userId: string) {
    const before = this.db.users.length;
    this.db.users = this.db.users.filter(u => u.userId !== userId);
    this.persist();
    return this.db.users.length < before;
  }
  async listRecords() { return [...this.db.records]; }
}
