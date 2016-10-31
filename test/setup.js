import { initializeParse, createAdminUser } from './parseHelper'
import '../src/index'

// Stops if we have any change to do something harmful
if (process.env.MASTER_KEY) throw new Error('Invalid test environment')

const setup = (async () => { // eslint-disable-line
  initializeParse()
  await createAdminUser()
  run() // eslint-disable-line
})()
