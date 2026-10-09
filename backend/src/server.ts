import { createApp } from './app';
import { config } from './config';
import { buildSeed } from './seed-data';
import { createStore } from './stores';

async function main(): Promise<void> {
  const store = createStore();
  await store.init();
  await store.seedIfEmpty(buildSeed());
  createApp(store).listen(config.port, () =>
    console.log(`Gatehouse API on http://localhost:${config.port} (storage: ${config.store})`));
}

main().catch(err => { console.error('Failed to start:', err); process.exit(1); });
