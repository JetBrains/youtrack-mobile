/* @flow */
import * as types from './action-types';
import Api from '../components/api/api';
import type Auth from '../components/auth/auth';
import Router from '../components/router/router';
import {AsyncStorage} from 'react-native';
import {PROJECT_ID_STORAGE_KEY, DRAFT_ID_STORAGE_KEY} from '../views/create-issue/create-issue';

export function initializeApi(auth: Auth) {
  return {
    type: types.INITIALIZE_API,
    auth,
    api: new Api(auth)
  };
}

export function clearDrafts() {
  AsyncStorage.multiRemove([PROJECT_ID_STORAGE_KEY, DRAFT_ID_STORAGE_KEY]);
}

export function logOut() {
  return (dispatch: (any) => any, getState: () => Object) => {
    clearDrafts();
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
