import express from 'express'
import { ParseServer } from 'parse-server'
import logger from 'utils/logger'
import * as keys from 'config/keys'
import schemas from 'schemas'
import { createRoleIfNotExists } from 'parse-utils'
import { loadClassesFromSchemas } from 'utils/parse'

// Create the express app
const app = express()

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
  enableAnonymousUsers: false
})

// Serve the Parse API
app.use(keys.PARSE_MOUNT, parseServer)

// Start the server
app.listen(keys.PORT, async () => {
  await createRoleIfNotExists('placeOwner', { useMasterKey: true })
  await loadClassesFromSchemas(schemas)
  logger.log('[Parse-Server] Initialization completed: up and running.')
  logger.log(`${keys.APP_NAME} running on port ${keys.PORT}.`)
})

// Export the app for testing
export default app
