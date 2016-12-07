/* @flow */
export type ParseUser = {
  get: (name: string) => any;
  getSessionToken: () => string;
  set: (name: string, value: any) => ParseUser;
  save: (savedValues: ?Object, params: ?Object) => ParseUser;
}

export type ParseObject = {
  get: (name: string) => any;
  set: (name: string, value: any) => ParseObject;
  isNew: () => boolean;
  save: (savedValues: ?Object, params: ?Object) => ParseObject;
}

export type ParseRequest = {
  user: ParseUser;
  object: ParseObject;
  params: Object;
  master: boolean;
}

export type ParseResponse = {
  success: (value: any) => void;
  error: (value: any) => void;
}

export type ParsePointer = {
  __type: string;
  className: string;
  objectId: string;
}
