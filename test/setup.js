/* @flow */
import Parse from 'parse/node';
import { setParseLib, initializeParseSDK, createRoleIfNotExists } from 'parse-utils';
import '../src/index';

// Stops if we have any chance to do something harmful
if (process.env.MASTER_KEY) throw new Error('Invalid test environment');

const setup = (async () => {
  setParseLib(Parse);
  initializeParseSDK('http://localhost:1337/api', 'TEST_APP_ID', 'TEST_MASTER_KEY');
  await createRoleIfNotExists('placeOwner', { useMasterKey: true });
  // $FlowFixMe
  run(); // eslint-disable-line
})();
