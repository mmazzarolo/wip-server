/* @flow */
import Parse from 'parse/node'
import { difference, find, includes, isEmpty } from 'lodash'

import type { ParseRequest, ParseResponse } from 'src/types/ParseServer'

type params = {
  placeId: ?string;
  subscriptionTypes: Array<string>;
}

const AVAILABLE_SUBSCRIPTION_TYPES = ['PUSH', 'EMAIL']

export default async (req: ParseRequest, res: ParseResponse) => {
  try {
    const user = req.user
    const sessionToken = user.getSessionToken()
    const requestParams: params = req.params

    // Params validation
    const { placeId, subscriptionTypes } = requestParams
    if (!placeId) {
      throw new Error('Missing placeId')
    }

    if (!subscriptionTypes || isEmpty(subscriptionTypes)) {
      throw new Error('Missing subscriptionType')
    }

    const invalidSubscriptions = difference(subscriptionTypes, AVAILABLE_SUBSCRIPTION_TYPES)
    if (!isEmpty(invalidSubscriptions)) {
      throw new Error('Invalid subscriptionType')
    }

    // Obtain the Place
    const place = await new Parse.Query('Place')
      .equalTo('objectId', requestParams.placeId)
      .first()

    // Update the push notifications settings
    if (includes(subscriptionTypes, 'PUSH')) {
      const pushSubscriptions: Array<Object> = user.get('subscribedByMailTo') || []
      if (find(pushSubscriptions, { id: place.id })) {
        throw new Error('User is already subscribed by push to this place')
      }
      pushSubscriptions.push(place)
      user.set('pushSubscriptions', pushSubscriptions)
      const pushSubscribers: Array<Object> = place.get('pushSubscribers') || []
      if (find(pushSubscribers, { id: user.id })) {
        throw new Error('Place already has this user subscribed by push')
      }
      pushSubscribers.push(user)
      place.set('pushSubscribers', pushSubscribers)
    }

    // Update the email notifications settings
    if (includes(subscriptionTypes, 'EMAIL')) {
      const emailSubscriptions: Array<Object> = user.get('emailSubscriptions') || []
      if (find(emailSubscriptions, { id: place.id })) {
        throw new Error('User is already subscribed by email to this place')
      }
      emailSubscriptions.push(place)
      user.set('emailSubscriptions', emailSubscriptions)
      const emailSubscribers: Array<Object> = place.get('emailSubscribers') || []
      if (find(emailSubscribers, { id: user.id })) {
        throw new Error('Place already has this user subscribed by email')
      }
      emailSubscribers.push(user)
      place.set('emailSubscribers', emailSubscribers)
    }

    await Promise.all([
      user.save(null, { sessionToken }),
      place.save(null, { sessionToken })
    ])

    // Done
    return res.success('success')
  } catch (err) {
    console.error(`Error: ${err.message}`)
    return res.error(err.message)
  }
}
