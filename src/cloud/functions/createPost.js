/* @flow */
import Parse from 'parse/node'
import { isUserInRole } from 'parse-utils'

import logger from 'src/utils/logger'

import type { ParseRequest, ParseResponse } from 'src/types/ParseServer'

const Post = Parse.Object.extend('Post')

type params = {
  placeId: ?string,
  postTitle: ?string,
  postContent: ?string
}

export default async (req: ParseRequest, res: ParseResponse) => {
  try {
    const requestUser = req.user
    const requestParams: params = req.params
    const { placeId, postTitle, postContent } = requestParams

    let post

    // Params validation
    if (!placeId) {
      throw new Error('Missing placeId')
    }

    if (!postTitle) {
      throw new Error('Missing postTitle')
    }

    if (!postContent) {
      throw new Error('Missing postContent')
    }

    // Obtain the Place
    const place = await new Parse.Query('Place')
      .equalTo('objectId', requestParams.placeId)
      .include('ownersRole')
      .first()

    // Obtain the User
    const user = await new Parse.Query('User')
      .equalTo('objectId', requestUser.id)
      .first()

    // Check user permissions
    const placeRole = place.get('ownersRole')
    const isUserAuthorized = await isUserInRole(user.id, placeRole.get('name'))
    if (!isUserAuthorized) {
      throw new Error('User is not allowed to post on this place')
    }

    // Create the Post
    post = new Post()
    post.set('title', postTitle)
    post.set('content', postContent)
    place.set('createdBy', user)
    place.set('ownersRole', placeRole)

    // Set the Post ACL
    const postACL = new Parse.ACL()
    postACL.setPublicReadAccess(true)
    postACL.setPublicWriteAccess(false)
    postACL.setRoleWriteAccess(placeRole, true)
    post.setACL(postACL, {})

    // Save the Post
    post = await post.save(null, { useMasterKey: true })

    // Done
    return res.success(post)
  } catch (err) {
    logger.error(`Error: ${err.message}`)
    return res.error(err.message)
  }
}
