import { isEmpty } from 'lodash'
import logger from '../../utils/logger'
import errors from '../../utils/errors'

export default async (req, res) => {
  try {
    const user = req.object

    if (user.isNew() && !req.master) {
      // Set username as email
      const email = user.get('email')
      user.set('username', email)
    }

    // Done
    return res.success(user)

    // Error handling
  } catch (err) {
    logger.error(`Errore: ${err.message}`)
    return res.error(err.message)
  }
}
