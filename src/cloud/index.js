/* @flow */
import Parse from 'parse/node'

import beforeSaveUser from 'src/cloud/triggers/beforeSaveUser'
import beforeSavePlace from 'src/cloud/triggers/beforeSavePlace'

import createPlace from 'src/cloud/functions/createPlace'
import setSubscriptions from 'src/cloud/functions/setSubscriptions'

const User = Parse.Object.extend('_User')
const Place = Parse.Object.extend('Place')

Parse.Cloud.beforeSave(Place, beforeSavePlace)
Parse.Cloud.beforeSave(User, beforeSaveUser)

Parse.Cloud.define('createPlace', createPlace)
Parse.Cloud.define('setSubscriptions', setSubscriptions)
