/* @flow */
import * as types from './action-types';
import Api from '../components/api/api';
import type Auth from '../components/auth/auth';
import Router from '../components/router/router';

export function initializeApi(auth: Auth) {
  return {
    type: types.INITIALIZE_API,
    auth,
    api: new Api(auth)
  };
}

export function logOut() {
  return (dispatch: (any) => any, getState: () => Object) => {
    const auth = getState().app.auth;
    Router.EnterServer({serverUrl: auth.config.backendUrl});

    dispatch({type: types.LOG_OUT});
  };
}

export function openMenu() {
  return {type: types.OPEN_MENU};
}

export function closeMenu() {
  return {type: types.CLOSE_MENU};
}
