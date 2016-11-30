import Parse from 'parse/node'

const Place = Parse.Object.extend('Place')
const Role = Parse.Object.extend('_Role')

export default async (req, res) => {
  try {
    const user = req.user
    const userSessionToken = user.getSessionToken()
    const placeParams = req.params.place
    let place

    // Create the place
    place = await new Place().save(placeParams, { sessionToken: userSessionToken })

    // Create the place role
    const placeRole = new Role()
    placeRole.set('name', `placeOwner_${place.id}`)
    placeRole.relation('users').add(user)
    const placeRoleACL = new Parse.ACL()
    placeRoleACL.setPublicReadAccess(true)
    placeRoleACL.setPublicWriteAccess(false)
    placeRole.setACL(placeRoleACL, {})
    await placeRole.save({}, { useMasterKey: true })

    // Add the place role to the placeOwner one
    const placeOwnerRole = await new Parse.Query(Role)
      .equalTo('name', 'placeOwner')
      .first()
    placeOwnerRole.relation('roles').add(placeRole)
    await placeOwnerRole.save({}, { useMasterKey: true })

    // Finalize the place ACL
    const placeACL = new Parse.ACL()
    placeACL.setPublicReadAccess(false)
    placeACL.setPublicWriteAccess(true)
    placeACL.setRoleWriteAccess(placeRole, true)
    place.setACL(placeACL, {})

    // Set additional place info
    place.set('createdBy', user)
    place.set('ownersRole', placeRole)
    place = await place.save(null, { useMasterKey: true })

    // Done
    return res.success(place)

  } catch (err) {
    console.error(`Error: ${err.message}`)
    return res.error(err.message)
  }
}
