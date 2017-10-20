/* @flow */
import * as types from './action-types';
import Api from '../components/api/api';
import Router from '../components/router/router';
import log from '../components/log/log';
import {AsyncStorage, Linking} from 'react-native';
import UrlParse from 'url-parse';
import {PROJECT_ID_STORAGE_KEY, DRAFT_ID_STORAGE_KEY} from '../views/create-issue/create-issue';
import usage from '../components/usage/usage';
import {loadConfig, getStoredConfig} from '../components/config/config';
import Auth from '../components/auth/auth';
import type {AppConfigFilled} from '../flow/AppConfig';

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

export function openDebugView() {
  return {type: types.OPEN_DEBUG_VIEW};
}

export function closeDebugView() {
  return {type: types.CLOSE_DEBUG_VIEW};
}

export function onNavigateBack(closingView: Object) {
  return {type: types.ON_NAVIGATE_BACK, closingView};
}

export function initializeApi(auth: Auth) {
  return {type: types.INITIALIZE_API, api: new Api(auth)};
}

export function checkAuthorization() {
  return async (dispatch: (any) => any, getState: () => Object) => {
    const auth = getState().app.auth;
    await auth.loadStoredAuthParams();

    dispatch(initializeApi(auth));
    dispatch(setPermissions(auth));
    Router.IssueList();
  };
}

export function setAuth(config: AppConfigFilled) {
  const auth = new Auth(config);
  usage.init(config.statisticsEnabled);

  return {type: types.INITIALIZE_AUTH, auth};
}

export function setPermissions(auth: Auth) {
  return {type: types.SET_PERMISSIONS, auth};
}

export function initializeAuth(config: AppConfigFilled) {
  return async (dispatch: (any) => any, getState: () => Object) => {
    dispatch(setAuth(config));
    await dispatch(checkAuthorization());
  };
}

export function initializeApp(config: AppConfigFilled) {
  return async (dispatch: (any) => any, getState: () => Object) => {
    Router._getNavigator() && Router.Home({
      backendUrl: config.backendUrl,
      error: null,
      message: 'Connecting to YouTrack...'
    });

    try {
      await dispatch(initializeAuth(config));
    } catch (error) {
      log.warn('App failed to initialize auth. Will try to reload config.', error);
      let reloadedConfig;
      try {
        reloadedConfig = await loadConfig(config.backendUrl);
      } catch (error) {
        return Router.Home({backendUrl: config.backendUrl, error});
      }

      try {
        await dispatch(initializeAuth(reloadedConfig));
      } catch (e) {
        return Router.LogIn();
      }
    }
  };
}

export function connectToNewYoutrack(newURL: string) {
  return async (dispatch: (any) => any, getState: () => Object) => {
    const config = await loadConfig(newURL);
    dispatch(setAuth(config));
    Router.LogIn();
  };
}

export function getStoredConfigAndProceed() {
  return async (dispatch: (any) => any, getState: () => Object) => {
    const storedConfig: ?AppConfigFilled = await getStoredConfig();
    if (storedConfig) {
      return dispatch(initializeApp(storedConfig));
    }

    try {
      const url = await Linking.getInitialURL();
      if (!url) {
        return Router.EnterServer({serverUrl: null});
      }
      const host = UrlParse(url).host;
      return Router.EnterServer({serverUrl: host});
    } catch (e) {
      Router.EnterServer({serverUrl: null});
    }
  };
}
