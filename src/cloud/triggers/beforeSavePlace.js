/* @flow */
import type { ParseRequest, ParseResponse } from 'src/types/ParseServer'
import { isEmpty } from 'lodash'

export default async (req: ParseRequest, res: ParseResponse) => {
  const place = req.object
  const user = req.user
  if (req.master) return res.success(place)

  // Place validation
  if (!place.isNew()) {
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
  }

  // Done
  return res.success(user)
}
