import { isEmpty, isNil } from 'lodash'

export default async (req, res) => {
  const place = req.object
  const user = req.user
  const isMaster = !isNil(req.master)
  if (isMaster) return res.success(place)

  // Set owner on place creation
  if (place.isNew() && !req.master) {
    place.set('owner', user)
  }

  // Place validation
  if (isEmpty(place.get('name'))) {
    return res.error('The field "Name" is required')
  }

  if (isEmpty(place.get('description'))) {
    return res.error('The field "Description" is required')
  }

  if (isEmpty(place.get('country'))) {
    return res.error('The field "Country" is required')
  }

  if (isEmpty(place.get('province'))) {
    return res.error('The field "Province" is required')
  }

  if (isEmpty(place.get('town'))) {
    return res.error('The field "Town" is required')
  }

  if (isEmpty(place.get('zipCode'))) {
    return res.error('The field "ZipCode" is required')
  }

  if (isEmpty(place.get('address'))) {
    return res.error('The field "Address" is required')
  }

  // Done
  return res.success(user)
}
