import { config } from '../config';
import { DynamoStore } from './dynamo-store';
import { JsonStore } from './json-store';
import { MongoStore } from './mongo-store';
import { Store } from './store';

/** Picks the storage backend from the STORE environment variable. */
export function createStore(): Store {
  switch (config.store) {
    case 'mongo': return new MongoStore(config.mongoUri, config.mongoDb);
    case 'dynamo': return new DynamoStore({
      region: config.awsRegion, prefix: config.dynamoPrefix, endpoint: config.dynamoEndpoint
    });
    case 'json': return new JsonStore(config.jsonFile);
    default: throw new Error(`Unknown STORE "${config.store}". Use json, mongo or dynamo.`);
  }
}
