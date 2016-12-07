import Parse from 'parse/node'
import { setParseLib, initializeParseSDK, createRoleIfNotExists } from 'parse-utils'
import '../src/index'

// Stops if we have any change to do something harmful
if (process.env.MASTER_KEY) throw new Error('Invalid test environment')

const setup = (async () => { // eslint-disable-line
  setParseLib(Parse)
  initializeParseSDK('http://localhost:1337/api', 'TEST_APP_ID', 'TEST_MASTER_KEY')
  await createRoleIfNotExists('placeOwner', { useMasterKey: true })
  run() // eslint-disable-line
})()
