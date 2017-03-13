/* @flow */
import Parse from 'parse/node';
import { difference, find, includes, isEmpty, remove, replace } from 'lodash';

import logger from 'src/utils/logger';

import type { ParseRequest, ParseResponse } from 'src/types/ParseServer';

type Params = {
  placeId: string,
  subscriptionTypes: Array<string>,
};

const AVAILABLE_SUBSCRIPTION_TYPES = ['PUSH', 'EMAIL'];

export default async (req: ParseRequest, res: ParseResponse) => {
  try {
    const user = req.user;
    const sessionToken = user.getSessionToken();
    const params: Params = req.params;

    // Params validation
    if (!params.placeId) {
      throw new Error('Missing placeId');
    }

    if (!params.subscriptionTypes) {
      throw new Error('Missing subscriptionType');
    }

    const invalidSubscriptions = difference(params.subscriptionTypes, AVAILABLE_SUBSCRIPTION_TYPES);
    if (invalidSubscriptions !== 0) {
      throw new Error('Invalid subscriptionType');
    }

    // Obtain the Place
    const place = await new Parse.Query('Place').get(params.placeId);
    if (!place) {
      throw new Error('Place not found');
    }

    // Update the push notifications settings
    const enablePushSubscription = includes(params.subscriptionTypes, 'PUSH');
    const pushSubscriptions = user.get('pushSubscriptions') || [];
    const pushSubscribers = place.get('pushSubscribers') || [];
    if (enablePushSubscription) {
      if (!find(pushSubscriptions, { id: place.id })) pushSubscriptions.push(place);
      if (!find(pushSubscribers, { id: user.id })) pushSubscribers.push(user);
    } else {
      remove(pushSubscriptions, sub => sub.id === place.id);
      remove(pushSubscribers, sub => sub.id === user.id);
    }
    user.set('pushSubscriptions', pushSubscriptions);
    place.set('pushSubscribers', pushSubscribers);

    // Update the email notifications settings
    const enableEmailSubscription = includes(params, 'EMAIL');
    const emailSubscriptions = user.get('emailSubscriptions') || [];
    const emailSubscribers = place.get('emailSubscribers') || [];
    if (enableEmailSubscription) {
      if (!find(emailSubscriptions, { id: place.id })) emailSubscriptions.push(place);
      if (!find(emailSubscribers, { id: user.id })) emailSubscribers.push(user);
    } else {
      remove(emailSubscriptions, sub => sub.id === place.id);
      remove(emailSubscribers, sub => sub.id === user.id);
    }
    user.set('emailSubscriptions', emailSubscriptions);
    place.set('emailSubscribers', emailSubscribers);

    await Promise.all([place.save(null, { sessionToken }), user.save(null, { sessionToken })]);

    // Done
    return res.success({ pushSubscriptions, emailSubscriptions });
  } catch (err) {
    logger.error(`Error: ${err.message}`);
    return res.error(err.message);
  }
};
