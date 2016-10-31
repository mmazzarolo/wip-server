import Parse from 'parse/node'

const Role = Parse.Object.extend('_Role')
const User = Parse.Object.extend('_User')
const Account = Parse.Object.extend('Account')
const Service = Parse.Object.extend('Service')
const CsvImport = Parse.Object.extend('CsvImport')

export const initializeParse = () => {
  Parse.initialize('TEST_APP_ID', '', 'TEST_MASTER_KEY')
  Parse.serverURL = 'http://localhost:1337/api'
}

export const resetParse = async () => {
  const users = await new Parse.Query(User).notEqualTo('username', 'adminUser').find()
  await Parse.Object.destroyAll(users, { useMasterKey: true })
  const accounts = await new Parse.Query(Account).find()
  await Parse.Object.destroyAll(accounts, { useMasterKey: true })
  const services = await new Parse.Query(Service).find()
  await Parse.Object.destroyAll(services, { useMasterKey: true })
  const csvImports = await new Parse.Query(CsvImport).find()
  await Parse.Object.destroyAll(csvImports, { useMasterKey: true })
}

export const signupTestUser = async (user = {}, options) => {
  await new User({
    username: 'testUser',
    password: 'password',
    email: 'test@test.com',
    ...user
  }).save(null, options)
  return await Parse.User.logIn(
    user.username || 'testUser',
    user.password || 'password'
  )
}

export const createAdminUser = async () => {
  const adminUser = await new User({
    username: 'adminUser',
    password: 'password',
    email: 'admin@admin.com'
  }).save(null, { useMasterKey: true })
  const adminRole = await new Parse.Query(Role)
    .equalTo('name', 'admin')
    .first()
  const users = adminRole.relation('users')
  users.add(adminUser)
  await adminRole.save({}, { useMasterKey: true })
  console.log('createAdminUser -> done')
  return adminUser
}

export const getAdminUser = async () => {
  const admin = await Parse.User.logIn('adminUser', 'password')
  return admin
}
