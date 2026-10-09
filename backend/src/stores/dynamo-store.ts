import {
  CreateTableCommand, DescribeTableCommand, DynamoDBClient, waitUntilTableExists
} from '@aws-sdk/client-dynamodb';
import {
  DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand
} from '@aws-sdk/lib-dynamodb';
import { Database, RecordEntity, UserEntity } from '../models';
import { Store } from './store';

export interface DynamoOptions { region: string; prefix: string; endpoint?: string; }

/**
 * AWS DynamoDB backend. Tables (created automatically, on-demand billing):
 *   <prefix>-users    partition key: userId (S)
 *   <prefix>-records  partition key: id     (N)
 * Works with real AWS (credentials from env / AWS CLI / IAM role) or DynamoDB Local via `endpoint`.
 */
export class DynamoStore implements Store {
  private readonly raw: DynamoDBClient;
  private readonly doc: DynamoDBDocumentClient;
  private readonly usersTable: string;
  private readonly recordsTable: string;

  constructor(opts: DynamoOptions) {
    this.raw = new DynamoDBClient({
      region: opts.region,
      endpoint: opts.endpoint,
      credentials: opts.endpoint ? { accessKeyId: 'local', secretAccessKey: 'local' } : undefined
    });
    this.doc = DynamoDBDocumentClient.from(this.raw, { marshallOptions: { removeUndefinedValues: true } });
    this.usersTable = `${opts.prefix}-users`;
    this.recordsTable = `${opts.prefix}-records`;
  }

  async init(): Promise<void> {
    await this.ensureTable(this.usersTable, 'userId', 'S');
    await this.ensureTable(this.recordsTable, 'id', 'N');
  }

  async close(): Promise<void> { this.raw.destroy(); }

  private async ensureTable(name: string, key: string, type: 'S' | 'N'): Promise<void> {
    try {
      await this.raw.send(new DescribeTableCommand({ TableName: name }));
    } catch (err: any) {
      if (err.name !== 'ResourceNotFoundException') { throw err; }
      await this.raw.send(new CreateTableCommand({
        TableName: name,
        BillingMode: 'PAY_PER_REQUEST',
        AttributeDefinitions: [{ AttributeName: key, AttributeType: type }],
        KeySchema: [{ AttributeName: key, KeyType: 'HASH' }]
      }));
      await waitUntilTableExists({ client: this.raw, maxWaitTime: 60 }, { TableName: name });
    }
  }

  private async scan<T>(table: string, limit?: number): Promise<T[]> {
    const items: T[] = [];
    let startKey: Record<string, any> | undefined;
    do {
      const res = await this.doc.send(new ScanCommand({ TableName: table, ExclusiveStartKey: startKey, Limit: limit }));
      items.push(...((res.Items || []) as T[]));
      startKey = limit ? undefined : res.LastEvaluatedKey;
    } while (startKey);
    return items;
  }

  async seedIfEmpty(data: Database): Promise<void> {
    if ((await this.scan(this.usersTable, 1)).length === 0) {
      for (const u of data.users) { await this.doc.send(new PutCommand({ TableName: this.usersTable, Item: u })); }
    }
    if ((await this.scan(this.recordsTable, 1)).length === 0) {
      for (const r of data.records) { await this.doc.send(new PutCommand({ TableName: this.recordsTable, Item: r })); }
    }
  }

  async findUser(userId: string) {
    const res = await this.doc.send(new GetCommand({ TableName: this.usersTable, Key: { userId } }));
    return res.Item as UserEntity | undefined;
  }
  async listUsers() { return this.scan<UserEntity>(this.usersTable); }
  async addUser(user: UserEntity) {
    await this.doc.send(new PutCommand({
      TableName: this.usersTable, Item: user, ConditionExpression: 'attribute_not_exists(userId)'
    }));
  }
  async updateUser(userId: string, patch: Partial<UserEntity>) {
    const current = await this.findUser(userId);
    if (!current) { return undefined; }
    const merged = { ...current, ...patch, userId };
    await this.doc.send(new PutCommand({ TableName: this.usersTable, Item: merged }));
    return merged;
  }
  async deleteUser(userId: string) {
    const res = await this.doc.send(new DeleteCommand({
      TableName: this.usersTable, Key: { userId }, ReturnValues: 'ALL_OLD'
    }));
    return !!res.Attributes;
  }
  async listRecords() { return this.scan<RecordEntity>(this.recordsTable); }
}
