import Parse from 'parse/node'
import { after, before, describe, it } from 'mocha'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { mockUser, mockPlace } from 'test/mocks'
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
    user = await new User(mockUser).signUp()
  })

  after(async () => {
    const users = await new Parse.Query(User).find()
    await Parse.Object.destroyAll(users, { useMasterKey: true })
    const places = await new Parse.Query(Place).find()
    await Parse.Object.destroyAll(places, { useMasterKey: true })
  })

  it('creates a Place successfully', async () => {
    place = await Parse.Cloud.run('createPlace', { place: mockPlace }, { sessionToken: user.getSessionToken() })
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
