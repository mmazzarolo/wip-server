/* @flow */
export default {
  IS_ENV_TEST: process.env.NODE_ENV === 'test',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/news-plane-server',
  APP_NAME: process.env.APP_NAME || 'TEST_APP',
  APP_ID: process.env.APP_ID || 'TEST_APP_ID',
  MASTER_KEY: process.env.MASTER_KEY || 'TEST_MASTER_KEY',
  SERVER_URL: process.env.SERVER_URL || 'http://localhost:1337/api',
  PORT: process.env.PORT || 1337,
  PARSE_MOUNT: process.env.PARSE_MOUNT || '/api',
};
