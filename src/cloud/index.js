import Parse from 'parse/node'

import beforeSaveUser from 'cloud/triggers/beforeSaveUser'
import beforeSavePlace from 'cloud/triggers/beforeSavePlace'

import createPlace from 'cloud/functions/createPlace'

const User = Parse.Object.extend('_User')
const Place = Parse.Object.extend('Place')

Parse.Cloud.beforeSave(Place, beforeSavePlace)
Parse.Cloud.beforeSave(User, beforeSaveUser)

Parse.Cloud.define('createPlace', createPlace)