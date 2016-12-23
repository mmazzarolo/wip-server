/* @flow */
import Parse from 'parse/node'
import { difference, find, includes, isEmpty, remove, replace } from 'lodash'

import logger from 'src/utils/logger'

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

    if (!subscriptionTypes) {
      throw new Error('Missing subscriptionType')
    }

    const invalidSubscriptions = difference(subscriptionTypes, AVAILABLE_SUBSCRIPTION_TYPES)
    if (!isEmpty(invalidSubscriptions)) {
      throw new Error('Invalid subscriptionType')
    }

    // Obtain the Place
    const place: ?Parse.Object = await new Parse.Query('Place')
      .equalTo('objectId', requestParams.placeId)
      .first()
    if (!place) {
      throw new Error('Place not found')
    }

    // Update the push notifications settings
    const enablePushSubscription: bool = includes(subscriptionTypes, 'PUSH')
    const pushSubscriptions: Array<Object> = user.get('pushSubscriptions') || []
    const pushSubscribers: Array<Object> = place.get('pushSubscribers') || []
    if (enablePushSubscription) {
      if (!find(pushSubscriptions, { id: place.id })) pushSubscriptions.push(place)
      if (!find(pushSubscribers, { id: user.id })) pushSubscribers.push(user)
    } else {
      remove(pushSubscriptions, (sub) => sub.id === place.id)
      remove(pushSubscribers, (sub) => sub.id === user.id)
    }
    user.set('pushSubscriptions', pushSubscriptions)
    place.set('pushSubscribers', pushSubscribers)

    // Update the email notifications settings
    const enableEmailSubscription: bool = includes(subscriptionTypes, 'EMAIL')
    const emailSubscriptions: Array<Object> = user.get('emailSubscriptions') || []
    const emailSubscribers: Array<Object> = place.get('emailSubscribers') || []
    if (enableEmailSubscription) {
      if (!find(emailSubscriptions, { id: place.id })) emailSubscriptions.push(place)
      if (!find(emailSubscribers, { id: user.id })) emailSubscribers.push(user)
    } else {
      remove(emailSubscriptions, (sub) => sub.id === place.id)
      remove(emailSubscribers, (sub) => sub.id === user.id)
    }
    user.set('emailSubscriptions', emailSubscriptions)
    place.set('emailSubscribers', emailSubscribers)

    await Promise.all([
      place.save(null, { sessionToken }),
      user.save(null, { sessionToken })
    ])

    // Done
    return res.success({ pushSubscriptions, emailSubscriptions })
  } catch (err) {
    logger.error(`Error: ${err.message}`)
    return res.error(err.message)
  }
}
