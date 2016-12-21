/* @flow */
import Parse from 'parse/node'
import { createPointerFromId } from 'parse-utils'

import logger from 'src/utils/logger'

import type { ParseRequest, ParseResponse } from 'src/types/ParseServer'

export default async (req: ParseRequest, res: ParseResponse) => {
  try {
    const user = req.user
    const placeParams = req.params.place
    let place

    // Create the place
    place = await new Parse.Object('Place').save(placeParams, { useMasterKey: true })

    // Create the place role
    const placeRole = new Parse.Role()
    placeRole.set('name', `placeOwner_${place.id}`)
    placeRole.relation('users').add(user)
    const placeRoleACL = new Parse.ACL()
    placeRoleACL.setPublicReadAccess(true)
    placeRoleACL.setPublicWriteAccess(false)
    placeRole.setACL(placeRoleACL, {})
    await placeRole.save(null, { useMasterKey: true })

    // Add the place role to the placeOwner one
    const placeOwnerRole: ?Parse.Object = await new Parse.Query('_Role')
      .equalTo('name', 'placeOwner')
      .first()
    if (!placeOwnerRole) {
      throw new Error('PlaceOwnerRole not found')
    }
    placeOwnerRole.relation('roles').add(placeRole)
    await placeOwnerRole.save(null, { useMasterKey: true })

    // Finalize the place ACL
    const placeACL = new Parse.ACL()
    placeACL.setPublicReadAccess(true)
    placeACL.setPublicWriteAccess(false)
    placeACL.setRoleWriteAccess(placeRole, true)
    place.setACL(placeACL, {})

    // Set additional place info
    place.set('createdBy', user)
    place.set('ownersRole', placeRole)
    place = await place.save(null, { useMasterKey: true })

    // Add the place to the user owned places
    const ownedPlaces: Array<Parse.Object> = user.get('ownedPlaces') || []
    ownedPlaces.push(createPointerFromId('Place', place.id))
    user.set('ownedPlaces', ownedPlaces)
    await user.save(null, { useMasterKey: true })

    // Done
    return res.success(place)
  } catch (err) {
    logger.error(`Error: ${err.message}`)
    return res.error(err.message)
  }
}
