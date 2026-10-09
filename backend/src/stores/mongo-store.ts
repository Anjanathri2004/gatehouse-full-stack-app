import { Collection, MongoClient } from 'mongodb';
import { Database, RecordEntity, UserEntity } from '../models';
import { Store } from './store';

/** MongoDB backend (local docker-compose or MongoDB Atlas). Collections: users, records. */
export class MongoStore implements Store {
  private readonly client: MongoClient;
  private users!: Collection<UserEntity>;
  private records!: Collection<RecordEntity>;
  private readonly noId = { projection: { _id: 0 } };

  constructor(uri: string, private readonly dbName: string) { this.client = new MongoClient(uri); }

  async init(): Promise<void> {
    await this.client.connect();
    const db = this.client.db(this.dbName);
    this.users = db.collection<UserEntity>('users');
    this.records = db.collection<RecordEntity>('records');
    await this.users.createIndex({ userId: 1 }, { unique: true });
    await this.records.createIndex({ id: 1 }, { unique: true });
  }

  async close(): Promise<void> { await this.client.close(); }

  async seedIfEmpty(data: Database): Promise<void> {
    if ((await this.users.countDocuments()) === 0) { await this.users.insertMany(data.users.map(u => ({ ...u }))); }
    if ((await this.records.countDocuments()) === 0) { await this.records.insertMany(data.records.map(r => ({ ...r }))); }
  }

  async findUser(userId: string) {
    return (await this.users.findOne({ userId }, this.noId)) ?? undefined;
  }
  async listUsers() { return this.users.find({}, this.noId).toArray(); }
  async addUser(user: UserEntity) { await this.users.insertOne({ ...user }); }
  async updateUser(userId: string, patch: Partial<UserEntity>) {
    const updated = await this.users.findOneAndUpdate(
      { userId }, { $set: patch }, { returnDocument: 'after', projection: { _id: 0 } });
    return updated ?? undefined;
  }
  async deleteUser(userId: string) { return (await this.users.deleteOne({ userId })).deletedCount > 0; }
  async listRecords() { return this.records.find({}, this.noId).toArray(); }
}
