import Parse from 'parse/node'
import { after, before, describe, it } from 'mocha'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { mockUser, mockPlace } from 'test/mocks'

const User = Parse.Object.extend('_User')
const Role = Parse.Object.extend('_Role')
const Place = Parse.Object.extend('Place')
const Post = Parse.Object.extend('Post')

chai.use(chaiAsPromised)
const assert = chai.assert

describe('createPost', () => {
  let authorizedUser
  let unauthorizedUser
  let place
  let post

  before(async () => {
    authorizedUser = await new User(mockUser).signUp()
    unauthorizedUser = await new User({
      username: 'unauthorized@test.com',
      password: 'unauthorized'
    }).signUp()
    place = await Parse.Cloud.run(
      'createPlace',
      { place: mockPlace },
      { sessionToken: authorizedUser.getSessionToken() }
    )
  })

  after(async () => {
    const users = await new Parse.Query(User).find()
    await Parse.Object.destroyAll(users, { useMasterKey: true })
    const places = await new Parse.Query(Place).find()
    await Parse.Object.destroyAll(places, { useMasterKey: true })
    const posts = await new Parse.Query(Post).find()
    await Parse.Object.destroyAll(posts, { useMasterKey: true })
  })

  it('fails: missing param: postTitle', async () => {
    const params = {
      placeId: '123',
      postContent: 'I am the content'
    }
    const options = { sessionToken: authorizedUser.getSessionToken() }
    return assert.isRejected(
      Parse.Cloud.run('createPost', params, options),
      new RegExp('Missing param: postTitle')
    )
  })

  it('fails: unauthorized user', async () => {
    const params = {
      placeId: place.id,
      postTitle: 'I am the title',
      postContent: 'I am the content'
    }
    const options = { sessionToken: unauthorizedUser.getSessionToken() }
    return assert.isRejected(
      Parse.Cloud.run('createPost', params, options),
      new RegExp('User is not allowed to post on this place')
    )
  })

  it('creates the place successfully', async () => {
    const params = {
      placeId: place.id,
      postTitle: 'I am the title',
      postContent: 'I am the content'
    }
    const options = { sessionToken: authorizedUser.getSessionToken() }
    post = await Parse.Cloud.run('createPost', params, options)
    assert.isOk(post)
  })

  it('checks that the post can be fetched and has the right values', async () => {
    post = await new Parse.Query(Post)
      .equalTo('objectId', post.id)
      .first({ sessionToken: authorizedUser.getSessionToken() })

    const placeRoleId = post.get('ownersRole').id
    const placeRole = await new Parse.Query(Role)
      .equalTo('objectId', placeRoleId)
      .first()

    assert.equal(post.get('title'), 'I am the title')
    assert.equal(post.get('place').id, place.id)
    assert.equal(post.get('content'), 'I am the content')
    assert.equal(post.get('createdBy').id, authorizedUser.id)
    assert.equal(placeRole.get('name'), `placeOwner_${place.id}`)
  })
})
