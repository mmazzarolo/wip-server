/* @flow */
import Parse from 'parse/node';
import { after, before, describe, it } from 'mocha';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { mockUser, mockPlace } from 'src/mocks';

chai.use(chaiAsPromised);
const assert = chai.assert;

describe('createPost', () => {
  let authorizedUser;
  let unauthorizedUser;
  let placeId;

  before(async () => {
    authorizedUser = await new Parse.User(mockUser).signUp();
    unauthorizedUser = await new Parse.User({
      username: 'unauthorized@test.com',
      password: 'unauthorized',
    }).signUp();
    const place = await Parse.Cloud.run(
      'createPlace',
      { place: mockPlace },
      { sessionToken: authorizedUser.getSessionToken() },
    );
    placeId = place.id;
  });

  after(async () => {
    const users = await new Parse.Query('_User').find();
    await Parse.Object.destroyAll(users, { useMasterKey: true });
    const roles = await new Parse.Query('_Role').find();
    await Parse.Object.destroyAll(roles, { useMasterKey: true });
    const places = await new Parse.Query('Place').find();
    await Parse.Object.destroyAll(places, { useMasterKey: true });
    const posts = await new Parse.Query('Post').find();
    await Parse.Object.destroyAll(posts, { useMasterKey: true });
  });

  it('fails: missing param: postTitle', async () => {
    const params = {
      placeId: '123',
      postContent: 'I am the content',
    };
    const options = { sessionToken: authorizedUser.getSessionToken() };
    // $FlowFixMe
    return assert.isRejected(
      Parse.Cloud.run('createPost', params, options),
      new RegExp('Missing param: postTitle'),
    );
  });

  it('fails: unauthorized user', async () => {
    const params = {
      placeId,
      postTitle: 'I am the title',
      postContent: 'I am the content',
    };
    const options = { sessionToken: unauthorizedUser.getSessionToken() };
    // $FlowFixMe
    return assert.isRejected(
      Parse.Cloud.run('createPost', params, options),
      new RegExp('User is not allowed to post on this place'),
    );
  });

  it('creates the post successfully', async () => {
    const params = {
      placeId,
      postTitle: 'I am the title',
      postContent: 'I am the content',
    };
    const options = { sessionToken: authorizedUser.getSessionToken() };
    const result = await Parse.Cloud.run('createPost', params, options);
    assert.isOk(result);
  });

  it('checks that the post can be fetched and has the right values', async () => {
    const post = await new Parse.Query('Post')
      .equalTo('postTitle', 'I am the title')
      .first({ sessionToken: authorizedUser.getSessionToken() });

    if (!post) throw new Error('post not found');

    const placeRoleId = post.get('ownersRole').id;
    const placeRole = await new Parse.Query('_Role').equalTo('objectId', placeRoleId).first();

    if (!placeRole) {
      throw new Error('placeRole not found');
    }
    assert.equal(post.get('title'), 'I am the title');
    assert.equal(post.get('place').id, placeId);
    assert.equal(post.get('content'), 'I am the content');
    assert.equal(post.get('createdBy').id, authorizedUser.id);
    assert.equal(placeRole.get('name'), `placeOwner_${placeId}`);
  });
});
