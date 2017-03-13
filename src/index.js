/* @flow */
import express from 'express';
import { ParseServer } from 'parse-server';
import { createRoleIfNotExists, loadClassesFromSchemas } from 'parse-utils';
import ParseConfig from 'parse-server/lib/Config';

import logger from 'src/utils/logger';
import keys from 'src/config/keys';
import schemas from 'src/schemas';

// Create the express app
const app = express();

const parseServer = new ParseServer({
  appName: keys.APP_NAME,
  databaseURI: keys.MONGODB_URI,
  cloud: `${__dirname}/cloud/index.js`,
  appId: keys.APP_ID,
  masterKey: keys.MASTER_KEY,
  serverURL: keys.SERVER_URL,
  port: keys.PORT,
  publicServerURL: keys.SERVER_URL,
  allowClientClassCreation: false,
  silent: keys.IS_ENV_TEST,
  enableAnonymousUsers: false,
});

// Serve the Parse API
app.use(keys.PARSE_MOUNT, parseServer);

// Start the server
app.listen(keys.PORT, async () => {
  const parseConfig = new ParseConfig(keys.APP_ID, keys.PARSE_MOUNT);
  await createRoleIfNotExists('placeOwner', { useMasterKey: true });
  await loadClassesFromSchemas(parseConfig.database, schemas, true);
  logger.log('[Parse-Server] Initialization completed: up and running.');
  logger.log(`${keys.APP_NAME} running on port ${keys.PORT}.`);
});

// Export the app for testing
export default app;
