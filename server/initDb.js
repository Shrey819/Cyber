import { initMongoDb } from './initMongoDb.js';

export const initDb = initMongoDb;
export default initDb;

if (process.argv[1]?.endsWith('initDb.js')) {
  initMongoDb()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
