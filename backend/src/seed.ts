import { config } from './config';
import { buildSeed } from './seed-data';
import { createStore } from './stores';

/** `npm run seed` - connects to the configured store, creates tables/indexes, inserts demo data if empty. */
(async () => {
  const store = createStore();
  await store.init();
  await store.seedIfEmpty(buildSeed());
  console.log(`Seed complete (storage: ${config.store}). Users: ${(await store.listUsers()).length}`);
  await store.close();
})().catch(err => { console.error(err); process.exit(1); });
