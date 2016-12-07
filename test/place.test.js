import Parse from 'parse/node'
import { after, before, describe, it } from 'mocha'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { isUserInRole, getUserById } from 'parse-utils'

const User = Parse.Object.extend('_User')
const Role = Parse.Object.extend('_Role')
const Place = Parse.Object.extend('Place')

chai.use(chaiAsPromised)
const assert = chai.assert

describe('createPlace', () => {
  let user
  let place

  before(async () => {
    user = await new User()
      .set('username', 'user')
      .set('password', 'password')
      .set('email', 'user@test.it')
      .signUp()
  })

  after(async () => {
    const users = await new Parse.Query(User).find()
    await Parse.Object.destroyAll(users, { useMasterKey: true })
    const places = await new Parse.Query(Place).find()
    await Parse.Object.destroyAll(places, { useMasterKey: true })
  })

  it('fails: invalid place params', async () => {
    const placeParams = {
      name: 'I piaceri della carne'
    }
    return assert.isRejected(
      Parse.Cloud.run('createPlace', { place: placeParams }, { sessionToken: user.getSessionToken() }),
      new RegExp('The field "Description" is required')
    )
  })

  it('creates a Place successfully', async () => {
    const placeParams = {
      name: 'I piaceri della carne',
      description: 'hello',
      country: 'Italy',
      province: 'BS',
      phone: '0331 4108597',
      town: 'Borgosatollo',
      zipCode: '25010',
      address: 'Via Capo le Case, 27',
      email: 'DavideSabbatini@dayrep.com',
      imageCover: { __type: 'File', name: 'img.png', url: 'http://localhost:1337/api/files/TEST_APP_ID/img.png' }
    }
    place = await Parse.Cloud.run('createPlace', { place: placeParams }, { sessionToken: user.getSessionToken() })
    assert.isOk(place)
  })

  it('checks the Place role', async () => {
    const placeRoleId = place.get('ownersRole').id
    const placeRole = await new Parse.Query(Role)
      .equalTo('objectId', placeRoleId)
      .first()
    const placeRoleName = placeRole.get('name')
    const isInRole = await isUserInRole(user.id, placeRoleName)

    assert.isOk(placeRole)
    assert.equal(placeRoleName, `placeOwner_${place.id}`)
    assert.isTrue(isInRole)
  })

  it('checks the user', async () => {
    const placeRoleId = place.get('ownersRole').id
    const placeRole = await new Parse.Query(Role)
      .equalTo('objectId', placeRoleId)
      .first()
    const placeRoleName = placeRole.get('name')
    const isInRole = await isUserInRole(user.id, placeRoleName)
    const updatedUser = await getUserById(user.id)
    const ownedPlaces = updatedUser.get('ownedPlaces')

    assert.isOk(placeRole)
    assert.equal(placeRoleName, `placeOwner_${place.id}`)
    assert.isTrue(isInRole)
    assert.equal(user.id, place.get('createdBy').id)
    assert.equal(ownedPlaces[0].id, place.id)
  })
})
