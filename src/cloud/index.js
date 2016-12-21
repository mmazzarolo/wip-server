/* @flow */
import Parse from 'parse/node'

import beforeSaveUser from 'src/cloud/triggers/beforeSaveUser'
import beforeSavePlace from 'src/cloud/triggers/beforeSavePlace'

import createPlace from 'src/cloud/functions/createPlace'
import createPost from 'src/cloud/functions/createPost'
import setSubscriptions from 'src/cloud/functions/setSubscriptions'

Parse.Cloud.beforeSave('Place', beforeSavePlace)
Parse.Cloud.beforeSave('_User', beforeSaveUser)

Parse.Cloud.define('createPlace', createPlace)
Parse.Cloud.define('setSubscriptions', setSubscriptions)
Parse.Cloud.define('createPost', createPost)
