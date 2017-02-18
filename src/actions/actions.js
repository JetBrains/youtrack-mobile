/* @flow */
import * as types from './action-types';
import Api from '../components/api/api';
import type Auth from '../components/auth/auth';

export function initializeApi(auth: Auth) {
  return {
    type: types.INITIALIZE_API,
    auth,
    api: new Api(auth)
  };
}

export function logOut() {
  return {type: types.LOG_OUT};
}
