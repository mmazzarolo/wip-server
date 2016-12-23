/* @flow */
import type { ParseRequest, ParseResponse } from 'src/types/ParseServer'

export default async (req: ParseRequest, res: ParseResponse) => {
  const place = req.object
  const user = req.user
  if (req.master) return res.success(place)

  // Validation
  const attibuteNames = ['name', 'description', 'country', 'province', 'town', 'zipCode', 'address']
  for (const attr of attibuteNames) {
    if (!place.get(attr)) {
      return res.error(`The field "${attr}" is required`)
    }
  }

  // Done
  return res.success(user)
}
