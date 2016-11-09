export const IS_ENV_TEST = process.env.NODE_ENV === 'test'
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/news-plane-server'
export const APP_NAME = process.env.APP_NAME || 'TEST_APP'
export const APP_ID = process.env.APP_ID || 'TEST_APP_ID'
export const MASTER_KEY = process.env.MASTER_KEY || 'TEST_MASTER_KEY'
export const SERVER_URL = process.env.SERVER_URL || 'http://localhost:1337/api'
export const PORT = process.env.PORT || 1337
export const PARSE_MOUNT = process.env.PARSE_MOUNT || '/api'
