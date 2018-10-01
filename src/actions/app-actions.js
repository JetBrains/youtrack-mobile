/* @flow */
import * as types from './action-types';
import {getIsAuthorized} from '../reducers/app-reducer';
import {setApi} from '../components/api/api__instance';
import Api from '../components/api/api';
import Router from '../components/router/router';
import log from '../components/log/log';
import DeviceInfo from 'react-native-device-info';
import {initialState, clearCachesAndDrafts, populateStorage, getStorageState, flushStorage, flushStoragePart, getOtherAccounts, storeAccounts} from '../components/storage/storage';
import {Linking} from 'react-native';
import UrlParse from 'url-parse';
import openByUrlDetector, {isOneOfServers} from '../components/open-url-handler/open-url-handler';
import usage from '../components/usage/usage';
import {notifyError} from '../components/notification/notification';
import {loadConfig} from '../components/config/config';
import Auth from '../components/auth/auth';
import {loadAgileProfile} from '../views/agile-board/board-actions';
import {registerForPush, initializePushNotifications, unregisterForPushNotifications} from '../components/push-notifications/push-notifications';

import type {AuthParams, CurrentUser} from '../components/auth/auth';
import type {Permissions} from '../components/auth/auth__permissions';
import type {AppConfigFilled, EndUserAgreement} from '../flow/AppConfig';
import type {StorageState} from '../components/storage/storage';
import type RootState from '../reducers/app-reducer';

export function logOut() {
  return async (dispatch: (any) => any, getState: () => Object, getApi: () => Api) => {
    clearCachesAndDrafts();
    const auth = getState().app.auth;
    Router.EnterServer({serverUrl: auth.config.backendUrl});
    auth.logOut();
    setApi(null);
    dispatch({type: types.LOG_OUT});
    log.info('User has logged out');
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
  };
}

export function setAuth(config: AppConfigFilled) {
  const auth = new Auth(config);
  usage.init(config.statisticsEnabled);

  return {type: types.INITIALIZE_AUTH, auth};
}

export function setPermissions(permissions: Permissions, currentUser: CurrentUser) {
  return {type: types.SET_PERMISSIONS, permissions, currentUser};
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

function beginAccountChange() {
  return {type: types.BEGIN_ACCOUNT_CHANGE};
}

function endAccountChange() {
  return {type: types.END_ACCOUNT_CHANGE};
}

async function connectToOneMoreServer(serverUrl: string, onBack: Function): Promise<AppConfigFilled> {
  return new Promise(resolve => {
    Router.EnterServer({
      onCancel: onBack,
      serverUrl,
      connectToYoutrack: async (newURL) => resolve(await loadConfig(newURL))
    });
  });
}

async function authorizeOnOneMoreServer(auth, onBack: (serverUrl: string) => any) {
  return new Promise(resolve => {
    Router.LogIn({
      auth,
      onChangeServerUrl: onBack,
      onLogIn: (authParams: AuthParams) => resolve(authParams)
    });
  });
}

function applyAccount(config: AppConfigFilled, auth: Auth, authParams: AuthParams) {
  return async (dispatch: (any) => any, getState: () => RootState) => {
    const otherAccounts = getState().app.otherAccounts;
    const currentAccount = getStorageState();
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

export function addAccount(serverUrl: string = '') {
  return async (dispatch: (any) => any, getState: () => RootState) => {
    log.info('Adding new account flow started');

    try {
      const config = await connectToOneMoreServer(serverUrl, () => {
        log.info('Adding new server canceled by user');
        Router.IssueList();
      });
      log.info(`Config loaded for new server (${config.backendUrl}), logging in...`);
      // Note: this auth won't be initialized to the end ever. It is just a temperary instance
      const auth = new Auth(config);
      const authParams = await authorizeOnOneMoreServer(auth, function onBack(serverUrl: string) {
        log.info('Authorization canceled by user, going back');
        dispatch(addAccount(serverUrl));
      });
      log.info('Authorized on new server, applying');

      await dispatch(applyAccount(config, auth, authParams));
      await flushStoragePart({creationTimestamp: Date.now()});

      const user = (getStorageState().currentUser || {});
      log.info(`Successfully added account of "${user.name}" on "${config.backendUrl}"`);
    } catch (err) {
      notifyError('Could not add account', err);
      const {otherAccounts} = getState().app;
      if (!getStorageState().config && otherAccounts.length) {
        log.info('Recovering from add account error');
        await dispatch(changeAccount(otherAccounts[0], true));
      }
      Router.IssueList();
    }
  };
}

export function changeAccount(account: StorageState, dropCurrentAccount: boolean = false) {
  return async (dispatch: (any) => any, getState: () => RootState) => {
    log.info('Changing account', getState().currentUser, account.currentUser);
    const {config, authParams} = account;
    if (!authParams) {
      throw new Error('Account doesn\'t have valid authorization, cannot switch onto it.');
    }
    const auth = new Auth(config);

    dispatch(beginAccountChange());

    try {
      const otherAccounts = getState().app.otherAccounts.filter(acc => acc !== account);
      const currentAccount = dropCurrentAccount ? null : getStorageState();
      const newOtherAccounts = [...(currentAccount ? [currentAccount] : []), ...otherAccounts];

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

    dispatch(endAccountChange());
  };
}

export function removeAccountOrLogOut() {
  return async (dispatch: (any) => any, getState: () => RootState, getApi: () => Api) => {
    const otherAccounts = getState().app.otherAccounts;
    const {isRegisteredForPush} = getStorageState();

    if (isRegisteredForPush) {
      try {
        await unregisterForPushNotifications(getApi());
      } catch (err) {
        notifyError('Failed to unsubscribe from PUSH notifications', err);
      }
    }

    if (otherAccounts.length === 0) {
      log.info('No more accounts left, logging out.');
      return dispatch(logOut());
    }
    log.info('Removing account, choosing another one.');
    await dispatch(changeAccount(otherAccounts[0], true));
  };
}

function completeInitialization() {
  return async (dispatch: (any) => any, getState: () => Object) => {
    log.debug('Completing initialization: loading permissions cache');
    const auth = getState().app.auth;
    await auth.loadPermissions(auth.authParams);
    dispatch(setPermissions(auth.permissions, auth.currentUser));
    dispatch(subscribeToPush());
    dispatch(loadAgileProfile());

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
    dispatch(removeAccountOrLogOut());
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

    log.debug('Checking user agreement', currentUser);
    if (currentUser && currentUser.endUserAgreementConsent && currentUser.endUserAgreementConsent.accepted) {
      log.info('The EUA is already accepted, skiping check');
      return;
    }

    const agreement: ?EndUserAgreement = await api.getUserAgreement();
    if (!agreement) {
      log.debug('EUA is not supported by backend, skipping check');
      return;
    }
    if (!agreement.enabled) {
      log.debug('EUA is disabled, skipping check');
      return;
    }

    log.info('User agreement should be accepted', {...agreement, text: 'NOT_PRINTED'}, currentUser);
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

function subscribeToURL() {
  return async (dispatch: (any) => any, getState: () => Object) => {
    function isServerConfigured(url: ?string) {
      if (!isOneOfServers(url || '', [(getStorageState().config || {}).backendUrl])) {
        notifyError('Open URL error', {message: `"${url || ''}" doesn't match the configured server`});
        return false;
      }
      return true;
    }

    openByUrlDetector(
      (url, issueId) => {
        if (!getIsAuthorized(getState().app) || !isServerConfigured(url)) {
          log.debug('User is not authorized, URL won\'t be opened');
          return;
        }
        usage.trackEvent('app', 'Open issue in app by URL');
        Router.SingleIssue({issueId}, {forceReset: true});
      },
      (url, issuesQuery) => {
        if (!getIsAuthorized(getState().app) || !isServerConfigured(url)) {
          log.debug('User is not authorized, URL won\'t be opened');
          return;
        }
        usage.trackEvent('app', 'Open issues query in app by URL');
        Router.IssueList({query: issuesQuery});
      });
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
      await dispatch(completeInitialization());
    }

    dispatch(subscribeToURL());
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

    log.info('App is not configured, entering server URL');
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

function subscribeToPush(config: AppConfigFilled) {
  return async (dispatch: (any) => any, getState, getApi) => {
    const {isRegisteredForPush} = getStorageState();
    if (isRegisteredForPush) {
      log.debug('Device is already registered for push notifications');
      initializePushNotifications();
      return;
    }

    if (DeviceInfo.isEmulator()) {
      log.debug('Push notifcations won\'t work on simulator');
      return;
    }

    const api: Api = getApi();
    try {
      await registerForPush(api);
      await flushStoragePart({isRegisteredForPush: true});
      initializePushNotifications();
      log.debug('Successfully registered for push notifications');
    } catch (err) {
      const message = err?.message || err?.localizedDescription;
      if (
        ['Not implemented', 'remote notifications are not supported in the simulator', 'YouTrack does not support push notifications']
          .includes(message)
      ) {
        log.info(`Push notification is not supported: ${message}`);
        return;
      }

      notifyError('Couldn\'t register for notifications', err);
    }
  };
}
