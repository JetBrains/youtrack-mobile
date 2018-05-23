/* @flow */
import * as types from './action-types';
import {setApi} from '../components/api/api__instance';
import Api from '../components/api/api';
import Router from '../components/router/router';
import log from '../components/log/log';
import {initialState, clearCachesAndDrafts, populateStorage, getStorageState, flushStorage, flushStoragePart, getOtherAccounts, storeAccounts} from '../components/storage/storage';
import {Linking} from 'react-native';
import UrlParse from 'url-parse';
import usage from '../components/usage/usage';
import {notifyError} from '../components/notification/notification';
import {loadConfig} from '../components/config/config';
import Auth from '../components/auth/auth';

import type {AuthParams} from '../components/auth/auth';
import type {AppConfigFilled, EndUserAgreement} from '../flow/AppConfig';
import type {StorageState} from '../components/storage/storage';
import type RootState from '../reducers/app-reducer';

export function logOut() {
  return (dispatch: (any) => any, getState: () => Object) => {
    clearCachesAndDrafts();
    const auth = getState().app.auth;
    Router.EnterServer({serverUrl: auth.config.backendUrl});

    auth.logOut();
    setApi(null);
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

export function receiveOtherAccounts(otherAccounts: Array<StorageState>) {
  return {type: types.RECEIVE_OTHER_ACCOUNTS, otherAccounts};
}

export function checkAuthorization() {
  return async (dispatch: (any) => any, getState: () => Object) => {
    const auth = getState().app.auth;
    await auth.loadStoredAuthParams();
    await flushStoragePart({currentUser: auth.currentUser});

    setApi(new Api(auth));
    dispatch(setPermissions(auth));
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

function showUserAgreement(agreement) {
  usage.trackEvent('EUA is shown');
  return {type: types.SHOW_USER_AGREEMENT, agreement};
}

async function storeConfig(config: AppConfigFilled) {
  await flushStoragePart({config});
}

function populateAccounts() {
  return async (dispatch: (any) => any, getState: () => Object) => {
    const otherAccounts = await getOtherAccounts();
    dispatch(receiveOtherAccounts(otherAccounts));
  };
}

async function connectToOneMoreServer() {
  return new Promise((resolve, reject) => {
    Router.EnterServer({
      onCancel: reject,
      connectToYoutrack: async (newURL) => resolve(await loadConfig(newURL))
    });
  });
}

async function authorizeOnOneMoreServer(auth) {
  return new Promise((resolve, reject) => {
    Router.LogIn({
      auth,
      onLogIn: (authParams: AuthParams) => resolve(authParams)
    });
  });
}

function applyAccount(config: AppConfigFilled, auth: Auth, authParams: AuthParams) {
  return async (dispatch: (any) => any, getState: () => RootState) => {
    const otherAccounts = getState().app.otherAccounts;
    const currentAccount = await getStorageState();
    const newOtherAccounts = [currentAccount, ...otherAccounts];

    await storeAccounts(newOtherAccounts);
    dispatch(receiveOtherAccounts(newOtherAccounts));
    await flushStorage(initialState);

    await auth.storeAuth(authParams);
    await storeConfig(config);

    await dispatch(initializeAuth(config));
    await dispatch(checkUserAgreement());

    if (!getState().app.showUserAgreement) {
      dispatch(completeInitialization());
    }
  };
}

export function addAccount() {
  return async (dispatch: (any) => any, getState: () => RootState) => {
    log.info('Adding new account flow started');

    try {
      const config = await connectToOneMoreServer();
      log.info('Config loaded for new server, logging in...');
      const auth = new Auth(config);
      const authParams = await authorizeOnOneMoreServer(auth);
      log.info('Authorized on new server, applying');

      await dispatch(applyAccount(config, auth, authParams));
      await flushStoragePart({creationTimestamp: Date.now()});

      log.info('Successfully added account', config);
    } catch (err) {
      notifyError('Could not add account', err);
      Router.IssueList();
    }
  };
}

export function changeAccount(account: StorageState) {
  return async (dispatch: (any) => any, getState: () => RootState) => {
    log.info('Changing account', account.currentUser);
    const {config, authParams} = account;
    if (!authParams) {
      throw new Error('Account doesn\'t have valid authorization, cannot switch onto it.');
    }
    const auth = new Auth(config);

    try {
      const otherAccounts = getState().app.otherAccounts.filter(acc => acc !== account);
      const currentAccount = await getStorageState();
      const newOtherAccounts = [currentAccount, ...otherAccounts];

      await storeAccounts(newOtherAccounts);
      await flushStorage(account);

      await auth.storeAuth(authParams);
      await storeConfig(config);

      await dispatch(initializeAuth(config));
      await dispatch(checkUserAgreement());
      dispatch(receiveOtherAccounts(newOtherAccounts));

      if (!getState().app.showUserAgreement) {
        dispatch(completeInitialization());
      }


      log.info('Account has been changed', account.currentUser);
    } catch (err) {
      notifyError('Could not change account', err);
    }
  };
}

function completeInitialization() {
  return async (dispatch: (any) => any, getState: () => Object) => {
    log.info('Completing initialization: loading permissions cache');
    const auth = getState().app.auth;
    await auth.loadPermissions(auth.authParams);
    dispatch(setPermissions(auth));

    log.info('Initialization completed');
    Router.IssueList();
  };
}

export function acceptUserAgreement() {
  return async (dispatch: (any) => any, getState: () => Object, getApi: () => Api) => {
    log.info('User agreement has been accepted');
    usage.trackEvent('EUA is accepted');
    const api: Api = getApi();

    await api.acceptUserAgreement();

    dispatch({type: types.HIDE_USER_AGREEMENT});
    dispatch(completeInitialization());
  };
}

export function declineUserAgreement() {
  return async (dispatch: (any) => any, getState: () => Object, getApi: () => Api) => {
    log.info('User agreement has been declined');
    usage.trackEvent('EUA is declined');
    dispatch({type: types.HIDE_USER_AGREEMENT});
    dispatch(logOut());
  };
}

export function initializeAuth(config: AppConfigFilled) {
  return async (dispatch: (any) => any, getState: () => Object) => {
    dispatch(setAuth(config));
    await dispatch(checkAuthorization());
  };
}

function checkUserAgreement() {
  return async (dispatch: (any) => any, getState: () => Object, getApi: () => Api) => {
    const api: Api = getApi();
    const auth = getState().app.auth;
    const {currentUser} = auth;

    log.info('Checking user agreement', currentUser);
    if (currentUser && currentUser.endUserAgreementConsent && currentUser.endUserAgreementConsent.accepted) {
      log.info('The EUA is already accepted, skiping check');
      return;
    }

    const agreement: ?EndUserAgreement = await api.getUserAgreement();
    if (!agreement) {
      log.info('EUA is not supported by backend, skipping check');
      return;
    }
    if (!agreement.enabled) {
      log.info('EUA is disabled, skipping check');
      return;
    }

    log.info('User agreement should be accepted', agreement, currentUser);
    dispatch(showUserAgreement(agreement));
  };
}

export function applyAuthorization(authParams: AuthParams) {
  return async (dispatch: Function, getState: () => Object) => {
    const auth = getState().app.auth;
    await auth.storeAuth(authParams);
    await flushStoragePart({creationTimestamp: Date.now()});

    await dispatch(checkAuthorization());
    await dispatch(checkUserAgreement());

    if (!getState().app.showUserAgreement) {
      dispatch(completeInitialization());
    }
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
        await storeConfig(reloadedConfig);
      } catch (error) {
        return Router.Home({backendUrl: config.backendUrl, error});
      }

      try {
        await dispatch(initializeAuth(reloadedConfig));
      } catch (e) {
        return Router.LogIn();
      }
    }

    await dispatch(checkUserAgreement());

    if (!getState().app.showUserAgreement) {
      dispatch(completeInitialization());
    }
  };
}

export function connectToNewYoutrack(newURL: string) {
  return async (dispatch: (any) => any, getState: () => Object) => {
    const config = await loadConfig(newURL);
    await storeConfig(config);
    dispatch(setAuth(config));
    Router.LogIn();
  };
}

export function getStoredConfigAndProceed() {
  return async (dispatch: (any) => any, getState: () => Object) => {
    const state: StorageState = await populateStorage();
    dispatch(populateAccounts());

    if (state.config) {
      return dispatch(initializeApp(state.config));
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
