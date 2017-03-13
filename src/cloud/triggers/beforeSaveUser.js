/* @flow */
import type { ParseRequest, ParseResponse } from 'src/types/ParseServer';

export default async (req: ParseRequest, res: ParseResponse) => {
  const user = req.object;
  if (req.master) return res.success(user);

  // Set "username" to "email" on user creation
  if (user.isNew() && !req.master) {
    const email: string = user.get('email');
    user.set('username', email);
  }

  // Done
  return res.success(user);
};
