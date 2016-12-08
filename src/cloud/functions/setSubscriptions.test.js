import Parse from 'parse/node'
import { after, before, describe, it } from 'mocha'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { mockUser, mockPlace } from 'test/mocks'

const User = Parse.Object.extend('_User')
const Place = Parse.Object.extend('Place')

chai.use(chaiAsPromised)
const assert = chai.assert

describe('setSubscriptions', () => {
  let user
  let sessionToken
  let place

  before(async () => {
    user = await new User(mockUser).signUp()
    sessionToken = user.getSessionToken()
    place = await Parse.Cloud.run('createPlace', { place: mockPlace }, { sessionToken })
  })

  after(async () => {
    const users = await new Parse.Query(User).find()
    await Parse.Object.destroyAll(users, { useMasterKey: true })
    const places = await new Parse.Query(Place).find()
    await Parse.Object.destroyAll(places, { useMasterKey: true })
  })

  it('fails: missing placeId', async () => {
    const params = {
      placeId: null
    }
    return assert.isRejected(
      Parse.Cloud.run('setSubscriptions', params, { sessionToken }),
      new RegExp('Missing placeId')
    )
  })

  it('fails: missing subscriptionType', async () => {
    const params = {
      placeId: '1'
    }
    return assert.isRejected(
      Parse.Cloud.run('setSubscriptions', params, { sessionToken }),
      new RegExp('Missing subscriptionType')
    )
  })

  it('fails: invalid subscriptionTypes', async () => {
    const params = {
      placeId: place.id,
      subscriptionTypes: ['PUSH', 'INVALID']
    }
    return assert.isRejected(
      Parse.Cloud.run('setSubscriptions', params, { sessionToken }),
      new RegExp('Invalid subscriptionType')
    )
  })

  it('subscribe the user by push and email successfully', async () => {
    const params = {
      placeId: place.id,
      subscriptionTypes: ['PUSH', 'EMAIL']
    }
    const result = await Parse.Cloud.run('setSubscriptions', params, { sessionToken })
    assert.isOk(result)
  })

  it('checks that the user is subscribed correctly by push and email', async () => {
    user = await new Parse.Query(User)
      .equalTo('objectId', user.id)
      .first()
    place = await new Parse.Query(Place)
      .equalTo('objectId', place.id)
      .first()

    assert.equal(user.get('pushSubscriptions').length, 1)
    assert.equal(user.get('emailSubscriptions').length, 1)
    assert.equal(user.get('pushSubscriptions')[0].id, place.id)
    assert.equal(user.get('emailSubscriptions')[0].id, place.id)
    assert.equal(place.get('pushSubscribers').length, 1)
    assert.equal(place.get('emailSubscribers').length, 1)
    assert.equal(place.get('pushSubscribers')[0].id, user.id)
    assert.equal(place.get('emailSubscribers')[0].id, user.id)
  })

  it('unsubscribe the user by email successfully', async () => {
    const params = {
      placeId: place.id,
      subscriptionTypes: ['PUSH']
    }
    const result = await Parse.Cloud.run('setSubscriptions', params, { sessionToken })
    assert.isOk(result)
  })

  it('checks that the user is no more subscribed by email', async () => {
    user = await new Parse.Query(User)
      .equalTo('objectId', user.id)
      .first()
    place = await new Parse.Query(Place)
      .equalTo('objectId', place.id)
      .first()

    assert.equal(user.get('pushSubscriptions').length, 1)
    assert.equal(user.get('emailSubscriptions').length, 0)
    assert.equal(user.get('pushSubscriptions')[0].id, place.id)
    assert.equal(place.get('pushSubscribers').length, 1)
    assert.equal(place.get('emailSubscribers').length, 0)
    assert.equal(place.get('pushSubscribers')[0].id, user.id)
  })
})
