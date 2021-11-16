/* @flow */

import {Linking} from 'react-native';

import DeviceInfo from 'react-native-device-info';

import * as appActionsHelper from './app-actions-helper';
import * as types from './action-types';
import Api from '../components/api/api';
import Auth from '../components/auth/auth';
import log from '../components/log/log';
import openByUrlDetector, {isOneOfServers} from '../components/open-url-handler/open-url-handler';
import packageJson from '../../package.json';
import PermissionsStore from '../components/permissions-store/permissions-store';
import PushNotifications from '../components/push-notifications/push-notifications';
import PushNotificationsProcessor from '../components/push-notifications/push-notifications-processor';
import Router from '../components/router/router';
import UrlParse from 'url-parse';
import usage from '../components/usage/usage';
import {CUSTOM_ERROR_MESSAGE, UNSUPPORTED_ERRORS} from '../components/error/error-messages';
import {EVERYTHING_CONTEXT} from '../components/search/search-context';

import {
  clearCachesAndDrafts,
  flushStorage,
  flushStoragePart,
  getOtherAccounts,
  getStorageState,
  getStoredAuthParams,
  initialState,
  populateStorage,
  storeAccounts,
} from '../components/storage/storage';
import {hasType} from '../components/api/api__resource-types';
import {isIOSPlatform} from '../util/util';
import {getErrorMessage, isUnsupportedFeatureError} from '../components/error/error-resolver';
import {loadConfig} from '../components/config/config';
import {logEvent} from '../components/log/log-helper';
import {notify, notifyError} from '../components/notification/notification';
import {setApi} from '../components/api/api__instance';
import {storeSearchContext} from '../views/issues/issues-actions';

import type {Activity} from '../flow/Activity';
import type {AppConfigFilled, EndUserAgreement} from '../flow/AppConfig';
import type {AppState} from '../reducers';
import type {Article} from '../flow/Article';
import type {AuthParams} from '../flow/Auth';
import type {Folder, User, UserAppearanceProfile, UserArticlesProfile, UserGeneralProfile} from '../flow/User';
import type {NotificationRouteData} from '../flow/Notification';
import type {PermissionCacheItem} from '../flow/Permission';
import type {StorageState} from '../components/storage/storage';
import type {WorkTimeSettings} from '../flow/Work';
import type {RootState} from '../reducers/app-reducer';

type Action = (
  (dispatch: (any) => any, getState: () => AppState, getApi: () => Api) =>
    Promise<void> | Promise<mixed> | typeof undefined
  );


export function logOut(): Action {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: () => Api) => {
    clearCachesAndDrafts();
    const auth = getState().app.auth;
    Router.EnterServer({serverUrl: auth?.config?.backendUrl});
    if (auth) {
      auth.logOut();
    }
    setApi(null);
    dispatch({type: types.LOG_OUT});
    log.info('User is logged out');
  };
}

export function openDebugView(): { type: string } {
  return {type: types.OPEN_DEBUG_VIEW};
}

export function closeDebugView(): { type: string } {
  return {type: types.CLOSE_DEBUG_VIEW};
}

export function setEnabledFeatures(features: Array<string>): { features: Array<string>, type: string } {
  return {type: types.SET_FEATURES, features};
}

export function onNavigateBack(closingView: Object): { closingView: any, type: string } {
  return {type: types.ON_NAVIGATE_BACK, closingView};
}

export function receiveOtherAccounts(otherAccounts: Array<StorageState>): { otherAccounts: Array<StorageState>, type: string } {
  return {type: types.RECEIVE_OTHER_ACCOUNTS, otherAccounts};
}

export function receiveUserAppearanceProfile(userAppearanceProfile?: UserAppearanceProfile): Action {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: () => Api) => {
    if (userAppearanceProfile) {
      try {
        const appearanceProfile: UserAppearanceProfile = await getApi().user.updateUserAppearanceProfile(
          'me',
          userAppearanceProfile
        );
        dispatch({
          type: types.RECEIVE_USER_APPEARANCE_PROFILE,
          ...{appearance: appearanceProfile},
        });
      } catch (error) {
        log.info('Can\'t update user appearance profile.');
      }
    }
  };
}

export function updateUserGeneralProfile(userGeneralProfile: $Shape<UserGeneralProfile>): Action {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: () => Api) => {
    try {
      const updatedUserGeneralProfile: UserGeneralProfile = await getApi().user.updateUserGeneralProfile(
        userGeneralProfile
      );

      if (updatedUserGeneralProfile.searchContext === null) {
        updatedUserGeneralProfile.searchContext = EVERYTHING_CONTEXT;
      }

      dispatch({
        type: types.RECEIVE_USER_GENERAL_PROFILE,
        ...{general: updatedUserGeneralProfile},
      });
    } catch (e) {
      log.info('Cannot update your profile');
    }
  };
}

export const updateUserArticlesProfile = (articlesProfile: UserArticlesProfile | { lastVisitedArticle: null }): Action =>
  async (dispatch: (any) => any, getState: () => AppState, getApi: () => Api) => {
    dispatch({
      type: types.RECEIVE_USER_ARTICLES_PROFILE,
      ...{articles: articlesProfile},
    });
  };

export const resetUserArticlesProfile = (): Action => async (
  dispatch: (any) => any,
  getState: () => AppState,
  getApi: () => Api
) => {
  dispatch(updateUserArticlesProfile({lastVisitedArticle: null}));
};

export const cacheUserLastVisitedArticle = (article: Article | null, activities?: Array<Activity>) => {
  try {
    if (!article || !article.id) {
      flushStoragePart({articleLastVisited: null});
    } else {
      const articleLastVisited: {
        article?: Article,
        activities?: Array<Activity>
      } | null = getStorageState().articleLastVisited;

      flushStoragePart({
        articleLastVisited: {
          ...{article},
          activities: activities || (
            articleLastVisited?.article?.id === article.id ? articleLastVisited?.activities : null
          ),
        },
      });
    }
  } catch (e) {
    logEvent({message: 'Failed to store locally the last visited article', isError: true});
  }
};

export function checkAuthorization(): Action {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: () => Api) => {
    const auth: Auth = ((getState().app.auth: any): Auth);
    await auth.setAuthParamsFromCache();
    await flushStoragePart({currentUser: auth.currentUser});

    setApi(new Api(auth));
  };
}

export function setAuth(config: AppConfigFilled): { auth: Auth, type: string } {
  const auth: Auth = new Auth(config);
  usage.init(config.statisticsEnabled);

  return {type: types.INITIALIZE_AUTH, auth};
}

function showUserAgreement(agreement) {
  usage.trackEvent('EUA is shown');
  return {type: types.SHOW_USER_AGREEMENT, agreement};
}

async function storeConfig(config: AppConfigFilled) {
  await flushStoragePart({config});
}

function populateAccounts() {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: () => Api) => {
    const otherAccounts: Array<StorageState> = await getOtherAccounts();
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
      connectToYoutrack: async (newURL) => resolve(await loadConfig(newURL)),
    });
  });
}

async function authorizeOnOneMoreServer(config: AppConfigFilled, onBack: (serverUrl: string) => any) {
  return new Promise(resolve => {
    Router.LogIn({
      config,
      onChangeServerUrl: onBack,
      onLogIn: (authParams: AuthParams) => resolve(authParams),
    });
  });
}

function applyAccount(config: AppConfigFilled, auth: Auth, authParams: AuthParams): Action {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: () => Api) => {
    const otherAccounts: Array<StorageState> = getState().app.otherAccounts || [];
    const currentAccount: StorageState = getStorageState();
    const newOtherAccounts: Array<StorageState> = [currentAccount, ...otherAccounts];

    await storeAccounts(newOtherAccounts);
    dispatch(receiveOtherAccounts(newOtherAccounts));
    const creationTimestamp: number = Date.now();
    await flushStorage({
      ...initialState,
      creationTimestamp: creationTimestamp,
      authParamsKey: creationTimestamp.toString(),
    });

    await auth.cacheAuthParams(authParams, creationTimestamp.toString());
    await storeConfig(config);

    await dispatch(initializeAuth(config));
    await dispatch(checkUserAgreement());

    if (!getState().app.showUserAgreement) {
      await dispatch(completeInitialization());
    }
  };
}

export function addAccount(serverUrl: string = ''): Action {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: () => Api) => {
    log.info('Adding new account started');

    try {
      const config: AppConfigFilled = await connectToOneMoreServer(serverUrl, () => {
        log.info('Adding new server canceled by user');
        Router.navigateToDefaultRoute();
      });
      log.info(`Config loaded for new server (${config.backendUrl}), logging in...`);

      const tmpAuthInstance: Auth = new Auth(config); //NB! this temporary instance for Login screen code
      const authParams: AuthParams = await authorizeOnOneMoreServer(config, function onBack(url: string) {
        log.info('Authorization canceled by user, going back');
        dispatch(addAccount(url));
      });
      log.info('Authorized on new server, applying');

      await dispatch(applyAccount(config, tmpAuthInstance, authParams));

      const user: ?User = getStorageState().currentUser;
      const userName: string = user?.name || '';
      log.info(`Successfully added account, user "${userName}", server "${config.backendUrl}"`);
    } catch (err) {
      const errorMsg: string = 'Failed to add an account.';
      notifyError(errorMsg, err);
      const {otherAccounts} = getState().app;
      if (!getStorageState().config && otherAccounts?.length) {
        log.info(`${errorMsg} Restoring prev account`);
        await dispatch(switchAccount(otherAccounts[0], true));
      }
      Router.navigateToDefaultRoute();
    }
  };
}

export function switchAccount(account: StorageState, dropCurrentAccount: boolean = false, issueId?: string): Action {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: () => Api) => {
    dispatch(resetUserArticlesProfile());
    cacheUserLastVisitedArticle(null);
    try {
      await dispatch(changeAccount(account, dropCurrentAccount, issueId));
    } catch (e) {
      await dispatch(changeAccount(getStorageState()));
    }
  };
}

export function updateOtherAccounts(
  account: StorageState,
  removeCurrentAccount: boolean = false
): (dispatch: (any) => any, getState: () => AppState, getApi: () => Api) => Promise<Array<StorageState>> {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: () => Api) => {
    const state: AppState = getState();

    const currentAccount: StorageState = getStorageState();
    log.info(`Changing account: ${currentAccount?.config?.backendUrl || ''} -> ${account?.config?.backendUrl || ''}`);

    const otherAccounts: Array<StorageState> = (state.app.otherAccounts || []).filter(
      (it: StorageState) => it.creationTimestamp !== account.creationTimestamp
    );
    const prevAccount = removeCurrentAccount ? null : currentAccount;
    const updatedOtherAccounts = [
      ...(prevAccount && currentAccount !== account ? [prevAccount] : []),
      ...otherAccounts,
    ];
    await storeAccounts(updatedOtherAccounts);
    await flushStorage(account);

    dispatch(receiveOtherAccounts(updatedOtherAccounts));
    return otherAccounts;
  };
}

export function changeAccount(account: StorageState, removeCurrentAccount?: boolean, issueId: ?string): Action {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: () => Api) => {
    const state: AppState = getState();
    const config: AppConfigFilled = ((account.config: any): AppConfigFilled);
    const authParams: ?AuthParams = await getStoredAuthParams(account.authParamsKey);
    if (!authParams) {
      const errorMessage: string = 'Account doesn\'t have valid authorization, cannot switch onto it.';
      notify(errorMessage);
      throw new Error(errorMessage);
    }
    const auth = new Auth(config);

    dispatch(beginAccountChange());

    try {
      await dispatch(updateOtherAccounts(account, removeCurrentAccount));

      await auth.cacheAuthParams(
        authParams,
        account.authParamsKey || ((account.creationTimestamp: any): number).toString()
      );
      await storeConfig(config);

      await dispatch(initializeAuth(config));
      await dispatch(checkUserAgreement());

      if (!state.app.showUserAgreement) {
        dispatch(completeInitialization(issueId));
      }
      log.info('Account changed, URL:', account?.config?.backendUrl);
    } catch (err) {
      notifyError('Could not change account', err);
    }

    dispatch(endAccountChange());
  };
}

export function removeAccountOrLogOut(): Action {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: () => Api) => {
    const otherAccounts: Array<StorageState> = getState().app.otherAccounts || [];

    if (isRegisteredForPush()) {
      setRegisteredForPush(false);
      try {
        await PushNotifications.unregister();
      } catch (err) {
        log.warn('Failed to unsubscribe from push notifications', err);
      }
    }

    if (otherAccounts.length === 0) {
      log.info('No more accounts left, logging out.');
      dispatch(logOut());
    } else {
      log.info('Removing account, choosing another one.');
      await dispatch(switchAccount(otherAccounts[0], true));
    }
  };
}

function setUserPermissions(permissions: Array<PermissionCacheItem>): Action {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: () => Api) => {
    const auth: Auth = ((getState().app.auth: any): Auth);
    dispatch({
      type: types.SET_PERMISSIONS,
      permissionsStore: new PermissionsStore(permissions),
      currentUser: auth.currentUser,
    });
  };
}

export function loadUserPermissions(): Action {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: () => Api) => {
    const auth: Auth = ((getState().app.auth: any): Auth);
    const authParams: AuthParams = ((auth.authParams: any): AuthParams);
    const permissions: Array<PermissionCacheItem> = await appActionsHelper.loadPermissions(
      authParams?.token_type,
      authParams?.access_token,
      auth.getPermissionsCacheURL()
    );

    await dispatch(setUserPermissions(permissions));
    log.info('PermissionsStore created');
    appActionsHelper.updateCachedPermissions(permissions);
    log.debug('Permissions stored');
  };
}

export function completeInitialization(issueId: string | null = null, navigateToActivity: boolean = false): Action {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: () => Api) => {
    log.debug('Completing initialization');
    await dispatch(loadUser());
    await dispatch(loadUserPermissions());
    await dispatch(cacheProjects());
    log.debug('Initialization completed');

    Router.navigateToDefaultRoute(issueId ? {issueId, navigateToActivity} : null);

    dispatch(loadWorkTimeSettings());
    dispatch(subscribeToPushNotifications());
  };
}

function loadUser(): Action {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: () => Api) => {
    const user: User = await getApi().user.getUser();
    const DEFAULT_USER_PROFILES: { general: $Shape<UserGeneralProfile>, appearance: $Shape<UserAppearanceProfile> } = {
      general: {searchContext: EVERYTHING_CONTEXT},
      appearance: {naturalCommentsOrder: true},
    };
    user.profiles = Object.assign({}, DEFAULT_USER_PROFILES, user.profiles);
    user.profiles.general.searchContext = user.profiles.general.searchContext || EVERYTHING_CONTEXT;
    await dispatch(storeSearchContext(user.profiles.general.searchContext));
    dispatch({type: types.RECEIVE_USER, user});
  };
}

function loadWorkTimeSettings(): Action {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: () => Api) => {
    const workTimeSettings: WorkTimeSettings = await getApi().getWorkTimeSettings();
    await dispatch({type: types.RECEIVE_WORK_TIME_SETTINGS, workTimeSettings});
  };
}

export function acceptUserAgreement(): Action {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: () => Api) => {
    log.info('User agreement accepted');
    usage.trackEvent('EUA is accepted');
    const api: Api = getApi();

    await api.acceptUserAgreement();

    dispatch({type: types.HIDE_USER_AGREEMENT});
    dispatch(completeInitialization());
  };
}

export function declineUserAgreement(): Action {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: () => Api) => {
    log.info('User agreement declined');
    usage.trackEvent('EUA is declined');
    dispatch({type: types.HIDE_USER_AGREEMENT});
    dispatch(removeAccountOrLogOut());
  };
}

export function initializeAuth(config: AppConfigFilled): Action {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: () => Api) => {
    dispatch(setAuth(config));
    await dispatch(checkAuthorization());
  };
}

function checkUserAgreement(): Action {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: () => Api): Promise<void> => {
    const api: Api = getApi();
    const auth: Auth = ((getState().app.auth: any): Auth);
    const {currentUser} = auth;

    log.debug('Checking user agreement', currentUser);
    if (currentUser && currentUser.endUserAgreementConsent && currentUser.endUserAgreementConsent.accepted) {
      log.info('The EUA already accepted, skip check');
      return;
    }

    const agreement: ?EndUserAgreement = await api.getUserAgreement();
    if (!agreement) {
      log.debug('EUA is not supported, skip check');
      return;
    }
    if (!agreement.enabled) {
      log.debug('EUA is disabled, skip check');
      return;
    }

    log.info('User agreement should be accepted', {...agreement, text: 'NOT_PRINTED'}, currentUser);
    dispatch(showUserAgreement(agreement));
  };
}

export function applyAuthorization(authParams: AuthParams): Action {
  return async (dispatch: Function, getState: () => AppState) => {
    const auth = getState().app.auth;
    const creationTimestamp: number = Date.now();
    await flushStoragePart({
      creationTimestamp: creationTimestamp,
      authParamsKey: creationTimestamp.toString(),
    });
    if (auth && authParams) {
      await auth.cacheAuthParams(authParams, creationTimestamp.toString());
    }

    await dispatch(checkAuthorization());
    await dispatch(checkUserAgreement());

    if (!getState().app.showUserAgreement) {
      dispatch(completeInitialization());
    }
  };
}

export function cacheProjects(): ((
  dispatch: (any) => any,
  getState: () => AppState,
  getApi: () => Api
) => Promise<Array<Folder>>) {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: () => Api) => {
    const userFolders: Array<Folder> = await getApi().user.getUserFolders(
      '',
      ['$type,id,shortName,name,pinned']
    );
    const projects: Array<Folder> = userFolders.filter((it: Folder) => hasType.project(it));
    await flushStoragePart({projects: projects});
    return projects;
  };
}

function getIsAuthorized(state: RootState): boolean {
  return !!state.auth?.currentUser;
}

function subscribeToURL(): Action {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: () => Api) => {
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
        Router.Issue({issueId}, {forceReset: true});
      },
      (url, issuesQuery) => {
        if (!getIsAuthorized(getState().app) || !isServerConfigured(url)) {
          log.debug('User is not authorized, URL won\'t be opened');
          return;
        }
        usage.trackEvent('app', 'Open issues query in app by URL');
        Router.Issues({query: issuesQuery});
      }
    );
  };
}

export function initializeApp(config: AppConfigFilled, issueId: string | null, navigateToActivity: boolean): Action {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: () => Api): any => {
    Router._getNavigator() && Router.Home({
      backendUrl: config.backendUrl,
      error: null,
      message: 'Connecting to YouTrack...',
    });

    const refreshConfig: () => Promise<void> = async (): Promise<void> => {
      const updatedConfig: AppConfigFilled = await loadConfig(config.backendUrl);
      await flushStoragePart({config: updatedConfig, currentAppVersion: packageJson.version});
    };

    const versionHasChanged: boolean = packageJson.version !== getStorageState().currentAppVersion;
    try {
      if (versionHasChanged) {
        log.info(
          `App upgraded from ${getStorageState().currentAppVersion || 'NOTHING'} to "${packageJson.version}"; reloading config`
        );
        await refreshConfig();
      }

      await dispatch(initializeAuth(config));
    } catch (error) {
      log.log('App failed to initialize auth. Reloading config...', error);
      let reloadedConfig;
      try {
        reloadedConfig = await loadConfig(config.backendUrl);
        await storeConfig(reloadedConfig);
      } catch (err) {
        Router.Home({backendUrl: config.backendUrl, err});
        return;
      }

      try {
        await dispatch(initializeAuth(reloadedConfig));
      } catch (e) {
        Router.LogIn({config, errorMessage: getErrorMessage(e)});
        return;
      }
    }

    await dispatch(checkUserAgreement());

    if (!getState().app.showUserAgreement) {
      await dispatch(completeInitialization(issueId, navigateToActivity));
    }

    dispatch(subscribeToURL());

    if (!versionHasChanged) {
      refreshConfig();
    }
  };
}

export function connectToNewYoutrack(newURL: string): Action {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: () => Api) => {
    const config = await loadConfig(newURL);
    await storeConfig(config);
    dispatch(setAuth(config));
    Router.LogIn({config});
  };
}

export function setAccount(notificationRouteData: NotificationRouteData | Object = {}): Action {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: () => Api) => {
    const state: StorageState = await populateStorage();
    await dispatch(populateAccounts());

    const notificationBackendUrl: ?string = notificationRouteData?.backendUrl;
    if (notificationBackendUrl && state?.config && notificationBackendUrl !== state.config?.backendUrl) {
      const notificationIssueAccount: ?StorageState = await appActionsHelper.targetAccountToSwitchTo(
        notificationBackendUrl
      );
      if (notificationIssueAccount) {
        await dispatch(updateOtherAccounts(notificationIssueAccount));
        flushStoragePart({config: notificationIssueAccount.config});
      }
    }

    const targetConfig = getStorageState().config;
    if (targetConfig) {
      dispatch(initializeApp(
        targetConfig,
        notificationRouteData?.issueId || null,
        notificationRouteData.navigateToActivity
      ));
    } else {
      log.info('App is not configured, entering server URL');
      const navigateTo = (serverUrl: string | null) => Router.EnterServer({serverUrl});
      try {
        const url = await Linking.getInitialURL();
        if (!url) {
          navigateTo(null);
        } else {
          const host = UrlParse(url).host;
          navigateTo(host);
        }
      } catch (e) {
        navigateTo(null);
      }
    }

  };
}

export function subscribeToPushNotifications(): Action {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: () => Api): Promise<void> => {
    if (DeviceInfo.isEmulator()) {
      return;
    }

    PushNotificationsProcessor.init();

    const onSwitchAccount = async (account: StorageState, issueId: string) => (
      await dispatch(switchAccount(account, false, issueId))
    );

    if (isRegisteredForPush()) {
      log.info('Device was already registered for push notifications. Initializing.');
      PushNotifications.initialize(onSwitchAccount);
      return;
    }

    try {
      await PushNotifications.register();
      PushNotifications.initialize(onSwitchAccount);
      setRegisteredForPush(true);
      log.info('Successfully registered for push notifications');
    } catch (err) {
      if (isUnsupportedFeatureError(err)) {
        log.warn(UNSUPPORTED_ERRORS.PUSH_NOTIFICATION_NOT_SUPPORTED);
        return;
      }

      log.warn(CUSTOM_ERROR_MESSAGE.PUSH_NOTIFICATION_REGISTRATION);
      notify(CUSTOM_ERROR_MESSAGE.PUSH_NOTIFICATION_REGISTRATION, err);
    }
  };
}


function isRegisteredForPush(): boolean { //TODO: YTM-1267
  const storageState: StorageState = getStorageState();
  return isIOSPlatform() ? storageState.isRegisteredForPush : Boolean(storageState.deviceToken);
}

function setRegisteredForPush(isRegistered: boolean) {
  if (isIOSPlatform()) { //TODO: also use device token
    flushStoragePart({isRegisteredForPush: isRegistered});
  }
}
