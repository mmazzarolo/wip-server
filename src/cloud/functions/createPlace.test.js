/* @flow */
import Parse from 'parse/node';
import { after, before, describe, it } from 'mocha';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { mockUser, mockPlace } from 'src/mocks';
import { isUserInRole, getUserById } from 'parse-utils';

chai.use(chaiAsPromised);
const assert = chai.assert;

describe('createPlace', () => {
  let userId;
  let userSessionToken;
  let placeId;

  before(async () => {
    const user = await new Parse.User(mockUser).signUp();
    userId = user.id;
    userSessionToken = user.getSessionToken();
  });

  after(async () => {
    const users = await new Parse.Query('_User').find();
    await Parse.Object.destroyAll(users, { useMasterKey: true });
    const roles = await new Parse.Query('_Role').find();
    await Parse.Object.destroyAll(roles, { useMasterKey: true });
    const places = await new Parse.Query('Place').find();
    await Parse.Object.destroyAll(places, { useMasterKey: true });
  });

  it('creates a Place successfully', async () => {
    const place = await Parse.Cloud.run(
      'createPlace',
      { place: mockPlace },
      { sessionToken: userSessionToken },
    );
    placeId = place.objectId;
    assert.isOk(place);
  });

  it('checks the Place role', async () => {
    const place = await Parse.Query('Place').get(placeId, { sessionToken: userSessionToken });
    if (!place) throw new Error('place not found');
    const placeRole = await new Parse.Query('_Role').equalTo('name', mockPlace.name).first();
    if (!placeRole) throw new Error('placeRole not found');
    const placeRoleName = placeRole.get('name');
    const isInRole = await isUserInRole(userId, placeRoleName);

    assert.isOk(placeRole);
    assert.equal(placeRoleName, `placeOwner_${place.id}`);
    assert.isTrue(isInRole);
  });

  it('checks the user', async () => {
    const place = await Parse.Query('Place').get(placeId, { sessionToken: userSessionToken });
    if (!place) throw new Error('place not found');
    const placeRoleId = place.get('ownersRole').id;
    const placeRole = await new Parse.Query('_Role').get(placeRoleId);
    if (!placeRole) throw new Error('placeRole not found');
    const placeRoleName = placeRole.get('name');
    const isInRole = await isUserInRole(userId, placeRoleName);
    const updatedUser = await getUserById(userId);
    const ownedPlaces = updatedUser.get('ownedPlaces');

    assert.isOk(placeRole);
    assert.equal(placeRoleName, `placeOwner_${place.id}`);
    assert.isTrue(isInRole);
    assert.equal(userId, place.get('createdBy').id);
    assert.equal(ownedPlaces[0].id, place.id);
  });
});
