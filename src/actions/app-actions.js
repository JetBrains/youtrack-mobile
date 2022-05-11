/* @flow */

import {Linking} from 'react-native';

import DeviceInfo from 'react-native-device-info';

import * as appActionsHelper from './app-actions-helper';
import * as types from './action-types';
import Api from 'components/api/api';
import OAuth2 from 'components/auth/oauth2';
import log from 'components/log/log';
import openByUrlDetector from 'components/open-url-handler/open-url-handler';
import packageJson from '../../package.json';
import PermissionsStore from 'components/permissions-store/permissions-store';
import PushNotifications from 'components/push-notifications/push-notifications';
import PushNotificationsProcessor from 'components/push-notifications/push-notifications-processor';
import Router from 'components/router/router';
import UrlParse from 'url-parse';
import usage from 'components/usage/usage';
import {i18n} from 'components/i18n/i18n';

import {
  clearCachesAndDrafts,
  flushStorage,
  flushStoragePart,
  getOtherAccounts,
  getStorageState,
  initialState,
  populateStorage,
  storageStateAuthParamsKey,
  storeAccounts,
} from 'components/storage/storage';
import {checkVersion, FEATURE_VERSION} from 'components/feature/feature';
import {getCachedPermissions, storeYTCurrentUser} from './app-actions-helper';
import {getErrorMessage} from 'components/error/error-resolver';
import {getStoredSecurelyAuthParams} from 'components/storage/storage__oauth';
import {hasType} from 'components/api/api__resource-types';
import {isIOSPlatform} from 'util/util';
import {isSplitView} from 'components/responsive/responsive-helper';
import {loadConfig} from 'components/config/config';
import {loadTranslation} from 'components/i18n/i18n-translation';
import {logEvent} from 'components/log/log-helper';
import {normalizeAuthParams} from 'components/auth/oauth2-helper';
import {notify, notifyError} from 'components/notification/notification';
import {setApi} from 'components/api/api__instance';

import type {Activity} from 'flow/Activity';
import type {AppConfig, EndUserAgreement} from 'flow/AppConfig';
import type {AppState} from '../reducers';
import type {Article} from 'flow/Article';
import type {AuthConfig, AuthParams, OAuthParams2} from 'flow/Auth';
import type {Folder, User, UserAppearanceProfile, UserArticlesProfile} from 'flow/User';
import type {NetInfoState} from '@react-native-community/netinfo';
import type {NotificationRouteData} from 'flow/Notification';
import type {PermissionCacheItem} from 'flow/Permission';
import type {StorageState} from 'components/storage/storage';
import type {WorkTimeSettings} from 'flow/Work';

type Action = (
  (dispatch: (any) => any, getState: () => AppState, getApi: () => Api) =>
    Promise<void> | Promise<mixed> | typeof undefined
  );

export function setNetworkState(networkState: NetInfoState): Action {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: () => Api) => {
    dispatch({type: types.SET_NETWORK, networkState});
  };
}

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

export function applyAuthParamsAndInitAPI(): Action {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: () => Api) => {
    const auth: OAuth2 = ((getState().app.auth: any): OAuth2);
    const doUpdate = async () => {
      await auth.loadCurrentUser(cachedAuthParams);
      await flushStoragePart({currentUser: {
          ...getStorageState().currentUser,
          ...auth.currentUser,
        }});
      setApi(new Api(auth));
    };

    const cachedCurrentUser: ?User = getStorageState().currentUser;
    if (cachedCurrentUser) {
      auth.setCurrentUser(cachedCurrentUser);
    }

    const cachedAuthParams: ?AuthParams = await auth.setAuthorizationFromCache();
    if (cachedAuthParams) {
      setApi(new Api(auth));
    }

    if (!cachedCurrentUser || !cachedAuthParams) {
      await doUpdate();
    } else {
      doUpdate();
    }
  };
}

export function createAuthInstance(config: AppConfig): { type: string, auth: OAuth2 } {
  const auth: OAuth2 = new OAuth2(config);
  usage.init(config.statisticsEnabled);
  return {type: types.INITIALIZE_AUTH, auth};
}

function showUserAgreement(agreement) {
  usage.trackEvent('EUA is shown');
  return {type: types.SHOW_USER_AGREEMENT, agreement};
}

async function storeConfig(config: AppConfig) {
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

async function connectToOneMoreServer(serverUrl: string, onBack: Function): Promise<AppConfig> {
  return new Promise(resolve => {
    Router.EnterServer({
      onCancel: onBack,
      serverUrl,
      connectToYoutrack: async (newURL) => resolve(await loadConfig(newURL)),
    });
  });
}

async function authorizeOnOneMoreServer(config: AppConfig, onBack: (serverUrl: string) => any) {
  return new Promise(resolve => {
    Router.LogIn({
      config,
      onChangeServerUrl: onBack,
      onLogIn: (authParams: OAuthParams2) => resolve(authParams),
    });
  });
}

function applyAccount(config: AppConfig, auth: OAuth2, authParams: OAuthParams2): Action {
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
      [storageStateAuthParamsKey]: creationTimestamp.toString(),
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
      const config: AppConfig = await connectToOneMoreServer(serverUrl, () => {
        log.info('Adding new server canceled by user');
        Router.navigateToDefaultRoute();
      });
      log.info(`Config loaded for new server (${config.backendUrl}), logging in...`);

      const tmpAuthInstance: OAuth2 = new OAuth2(config); //NB! this temporary instance for Login screen code
      const authParams: OAuthParams2 = await authorizeOnOneMoreServer(config, function onBack(url: string) {
        log.info('Authorization canceled by user, going back');
        dispatch(addAccount(url));
      });
      log.info('Authorized on new server, applying');

      await dispatch(applyAccount(config, tmpAuthInstance, normalizeAuthParams(authParams)));

      const user: ?User = getStorageState().currentUser;
      const userName: string = user?.name || '';
      log.info(`Successfully added account, user "${userName}", server "${config.backendUrl}"`);
    } catch (err) {
      notifyError(err);
      const {otherAccounts} = getState().app;
      if (!getStorageState().config && otherAccounts?.length) {
        log.info('Restoring prev account');
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
      redirectToHome(account.config.backendUrl);
      await dispatch(changeAccount(account, dropCurrentAccount, issueId));
    } catch (e) {}
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
    const config: AppConfig = ((account.config: any): AppConfig);
    const authParams: ?OAuthParams2 = await getStoredSecurelyAuthParams(account.authParamsKey);
    if (!authParams) {
      const errorMessage: string = i18n('The selected account is no longer authorized to use YouTrack Mobile. Please log in again.');
      notify(errorMessage);
      throw new Error(errorMessage);
    }
    const auth: OAuth2 = new OAuth2(config);

    dispatch(beginAccountChange());

    try {
      await dispatch(updateOtherAccounts(account, removeCurrentAccount));

      await auth.cacheAuthParams(
        (authParams: any),
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
      notifyError(err);
      throw (err);
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
    const auth: OAuth2 = ((getState().app.auth: any): OAuth2);
    dispatch({
      type: types.SET_PERMISSIONS,
      permissionsStore: new PermissionsStore(permissions),
      currentUser: auth.currentUser || getStorageState().currentUser,
    });
  };
}

export function loadUserPermissions(): Action {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: () => Api) => {
    const auth: OAuth2 = ((getState().app.auth: any): OAuth2);
    try {
      const permissions: Array<PermissionCacheItem> = await appActionsHelper.loadPermissions(
        auth.getTokenType(),
        auth.getAccessToken(),
        auth.getPermissionsCacheURL()
      );
      await dispatch(setUserPermissions(permissions));
      log.info('PermissionsStore created');
      appActionsHelper.updateCachedPermissions(permissions);
      log.debug('Permissions stored');
    } catch (error) {
      log.warn(error);
    }
  };
}

export function completeInitialization(
  issueId: string | null = null,
  navigateToActivity: boolean = false,
  skipNavigateToRoute: boolean = false,
): Action {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: () => Api) => {
    log.debug('Completing initialization');
    await dispatch(loadYTCurrentUser());
    await dispatch(loadUserPermissions());
    await dispatch(cacheProjects());
    log.debug('Initialization completed');

    if (!skipNavigateToRoute) {
      Router.navigateToDefaultRoute(issueId ? {issueId, navigateToActivity} : null);
    }

    dispatch(loadWorkTimeSettings());
    dispatch(subscribeToPushNotifications());
  };
}

export function setYTCurrentUser(user: User): Action {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: () => Api): Promise<void> => {
    await dispatch({type: types.RECEIVE_USER, user});
    await storeYTCurrentUser(user);
  };
}

export function loadYTCurrentUser(): Action {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: () => Api) => {
    const user: User = await getApi().user.getUser();
    await dispatch(setYTCurrentUser(user));
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

export function initializeAuth(config: AppConfig): Action {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: () => Api) => {
    dispatch(createAuthInstance(config));
    await dispatch(applyAuthParamsAndInitAPI());
  };
}

function checkUserAgreement(): Action {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: () => Api): Promise<void> => {
    const api: Api = getApi();
    const auth: OAuth2 = ((getState().app.auth: any): OAuth2);
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

export function onLogIn(authParams: AuthParams): Action {
  return async (dispatch: Function, getState: () => AppState) => {
    const auth: OAuth2 | null = getState().app.auth;
    const creationTimestamp: number = Date.now();
    const authStorageStateValue: string = creationTimestamp.toString();
    await flushStoragePart({
      creationTimestamp: creationTimestamp,
      [storageStateAuthParamsKey]: authStorageStateValue,
    });
    if (auth && authParams) {
      await auth.cacheAuthParams((authParams: any), authStorageStateValue);
    }

    await dispatch(applyAuthParamsAndInitAPI());
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

function subscribeToURL(): Action {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: () => Api) => {
    openByUrlDetector(
      (url, issueId) => {
        if (!getIsAuthorized()) {
          log.debug('User is not authorized, URL won\'t be opened');
          return;
        }
        usage.trackEvent('app', 'Open issue in app by URL');
        Router.Issue({issueId}, {forceReset: true});
      },
      (url, searchQuery) => {
        if (!getIsAuthorized()) {
          log.debug('User is not authorized, URL won\'t be opened');
          return;
        }
        usage.trackEvent('app', 'Open issues query in app by URL');
        Router.Issues({searchQuery});
      }
    );

    function getIsAuthorized(): boolean {
      return !!getState().app?.auth?.currentUser;
    }
  };
}

export function redirectToRoute(config: AppConfig, issueId: string | null, navigateToActivity: boolean): Action {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: () => Api): Promise<boolean> => {
    let isRedirected: boolean = false;

    try {
      let authParams: ?AuthParams = null;
      if (config) {
        //eslint-disable-next-line no-unused-vars
        const oauthData: { type: string, auth: OAuth2 } = dispatch(createAuthInstance(config));
        authParams = await oauthData.auth.getCachedAuthParams();
        oauthData.auth.setAuthParams(authParams);
        setApi(new Api(oauthData.auth));

        const user: ?User = getStorageState().currentUser?.ytCurrentUser;
        if (user && !user.guest) {
          await dispatch(setYTCurrentUser(user));
        } else {
          await dispatch(loadYTCurrentUser());
        }

        const cachedPermissions: ?Array<PermissionCacheItem> = getCachedPermissions();
        if (cachedPermissions) {
          await dispatch(setUserPermissions(cachedPermissions));
        }

        if (authParams && cachedPermissions) {
          if ((isSplitView()) || !issueId) {
            isRedirected = true;
            Router.Issues({issueId, navigateToActivity});
          } else if (issueId) {
            isRedirected = true;
            Router.Issues();
            Router.Issue({issueId, navigateToActivity});
          }
        }
      }
    } catch (e) {
    }

    if (!isRedirected) {
      redirectToHome(config.backendUrl);
    }

    return isRedirected;
  };
}

function redirectToHome(backendUrl: string = '') {
  Router.Home({
    backendUrl: backendUrl,
    error: null,
    message: 'Connecting to YouTrack...',
  });
}

async function refreshConfig(backendUrl: string): Promise<AppConfig> {
  const updatedConfig: AuthConfig = await loadConfig(backendUrl);
  await flushStoragePart({config: updatedConfig, currentAppVersion: packageJson.version});
  return updatedConfig;
}

export function initializeApp(config: AppConfig, issueId: string | null, navigateToActivity: boolean): Action {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: () => Api): any => {
    const isRedirectedToTargetRoute: boolean = await dispatch(redirectToRoute(config, issueId, navigateToActivity));

    if (checkVersion(FEATURE_VERSION.translations)) {
      if (!config.l10n) {
        const updatedConfig: AppConfig = await refreshConfig(config.backendUrl);
        return await dispatch(initializeApp(updatedConfig, issueId, navigateToActivity));
      } else {
        loadTranslation(config.l10n.locale, config.l10n.language);
      }
    }

    const versionHasChanged: boolean = packageJson.version !== getStorageState().currentAppVersion;
    try {
      if (versionHasChanged) {
        log.info(
          `App upgraded from ${getStorageState().currentAppVersion || 'NOTHING'} to "${packageJson.version}"; reloading config`
        );
        await refreshConfig(config.backendUrl);
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
      await dispatch(completeInitialization(issueId, navigateToActivity, isRedirectedToTargetRoute));
    }

    dispatch(subscribeToURL());

    if (!versionHasChanged) {
      refreshConfig(config.backendUrl);
    }
  };
}

export function connectToNewYoutrack(newURL: string): Action {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: () => Api) => {
    const config = await loadConfig(newURL);
    await storeConfig(config);
    dispatch(createAuthInstance(config));
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

    const targetConfig: ?AppConfig = getStorageState().config;
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
    if (await DeviceInfo.isEmulator()) {
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
      notifyError(err);
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
