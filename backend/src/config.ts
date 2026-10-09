import 'dotenv/config';
import * as path from 'path';

export type StoreKind = 'json' | 'mongo' | 'dynamo';

export const config = {
  port: Number(process.env.PORT) || 3000,
  jwtSecret: process.env.JWT_SECRET || 'gatehouse-dev-secret',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  store: (process.env.STORE || 'json') as StoreKind,
  jsonFile: process.env.DB_FILE || path.join(__dirname, '..', 'data', 'db.json'),
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017',
  mongoDb: process.env.MONGO_DB || 'gatehouse',
  awsRegion: process.env.AWS_REGION || 'ap-south-1',
  dynamoEndpoint: process.env.DYNAMO_ENDPOINT || undefined,
  dynamoPrefix: process.env.DYNAMO_TABLE_PREFIX || 'gatehouse'
};

if (process.env.NODE_ENV === 'production' && config.jwtSecret === 'gatehouse-dev-secret') {
  console.warn('WARNING: JWT_SECRET is not set. Set a long random value in production.');
}
