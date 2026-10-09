import { Database, RecordEntity, UserEntity } from '../models';

/** Storage contract. Routes depend only on this, so any backend can be plugged in. User IDs are stored lower-case. */
export interface Store {
  /** Connect / create tables / create indexes. */
  init(): Promise<void>;
  /** Insert demo data only when the store has no users. */
  seedIfEmpty(data: Database): Promise<void>;
  findUser(userId: string): Promise<UserEntity | undefined>;
  listUsers(): Promise<UserEntity[]>;
  addUser(user: UserEntity): Promise<void>;
  updateUser(userId: string, patch: Partial<UserEntity>): Promise<UserEntity | undefined>;
  deleteUser(userId: string): Promise<boolean>;
  listRecords(): Promise<RecordEntity[]>;
  close(): Promise<void>;
}
