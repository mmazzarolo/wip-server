import beforeSaveUser from 'cloud/triggers/beforeSaveUser'
import beforeSavePlace from 'cloud/triggers/beforeSavePlace'

const User = Parse.Object.extend('_User')
const Place = Parse.Object.extend('Place')

Parse.Cloud.beforeSave(Place, beforeSavePlace)
Parse.Cloud.beforeSave(User, beforeSaveUser)
