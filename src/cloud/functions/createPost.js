/* @flow */
import Parse from 'parse/node';
import { isUserInRole } from 'parse-utils';

import logger from 'src/utils/logger';

import type { ParseRequest, ParseResponse } from 'src/types/ParseServer';

type params = {
  placeId: ?string,
  postTitle: ?string,
  postContent: ?string,
};

export default async (req: ParseRequest, res: ParseResponse) => {
  try {
    const requestUser = req.user;
    const requestParams: params = req.params;
    let post;

    // Params validation
    const paramsNames = ['placeId', 'postTitle', 'postContent'];
    paramsNames.forEach(paramName => {
      if (!requestParams[paramName]) {
        throw new Error(`Missing param: ${paramName}`);
      }
    });
    const { placeId, postTitle, postContent } = requestParams;

    // Obtain the Place
    const place = await new Parse.Query('Place')
      .equalTo('objectId', placeId)
      .include('ownersRole')
      .first();
    if (!place) {
      throw new Error('Place not found');
    }

    // Obtain the User
    const user = await new Parse.Query('User').equalTo('objectId', requestUser.id).first();
    if (!user) {
      throw new Error('Invalid user');
    }

    // Check user permissions
    const placeRole = place.get('ownersRole');
    const isUserAuthorized = await isUserInRole(user.id, placeRole.get('name'));
    if (!isUserAuthorized) {
      throw new Error('User is not allowed to post on this place');
    }

    // Create the Post
    post = new Parse.Object('Post');
    post.set('title', postTitle);
    post.set('content', postContent);
    post.set('place', place);
    post.set('createdBy', user);
    post.set('ownersRole', placeRole);

    // Set the Post ACL
    const postACL = new Parse.ACL();
    postACL.setPublicReadAccess(true);
    postACL.setPublicWriteAccess(false);
    postACL.setRoleWriteAccess(placeRole, true);
    post.setACL(postACL, {});

    // Save the Post
    post = await post.save(null, { useMasterKey: true });

    // Done
    return res.success(post);
  } catch (err) {
    logger.error(`Error: ${err.message}`);
    return res.error(err.message);
  }
};
