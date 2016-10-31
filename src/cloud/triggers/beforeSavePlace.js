import { isEmpty } from 'lodash'
import logger from '../../utils/logger'
import errors from '../../utils/errors'

export default async (req, res) => {
  try {
    const place = req.object
    const user = req.user

    if (place.isNew() && !req.master) {
      place.set('owner', user)
    }

    // Done
    return res.success(user)

    // Error handling
  } catch (err) {
    logger.error(`Errore: ${err.message}`)
    return res.error(err.message)
  }
}
