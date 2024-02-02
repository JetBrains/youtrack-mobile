import {Linking, PermissionsAndroid, Platform} from 'react-native';

import DeviceInfo from 'react-native-device-info';
import UrlParse from 'url-parse';

import * as appActionsHelper from './app-actions-helper';
import * as navigator from 'components/navigation/navigator';
import * as storage from 'components/storage/storage';
import * as types from './action-types';
import Api from 'components/api/api';
import log from 'components/log/log';
import OAuth2 from 'components/auth/oauth2';
import packageJson from '../../package.json';
import PermissionsStore from 'components/permissions-store/permissions-store';
import PushNotifications from 'components/push-notifications/push-notifications';
import PushNotificationsProcessor from 'components/push-notifications/push-notifications-processor';
import Router from 'components/router/router';
import usage from 'components/usage/usage';
import {
  folderIdAllKey,
  folderIdMap,
} from 'views/inbox-threads/inbox-threads-helper';
import {checkVersion, FEATURE_VERSION} from 'components/feature/feature';
import {storeYTCurrentUser, targetAccountToSwitchTo} from './app-actions-helper';
import {getErrorMessage} from 'components/error/error-resolver';
import {getStoredSecurelyAuthParams} from 'components/storage/storage__oauth';
import {hasType} from 'components/api/api__resource-types';
import {i18n} from 'components/i18n/i18n';
import {isAndroidPlatform, isIOSPlatform, until} from 'util/util';
import {loadConfig} from 'components/config/config';
import {loadTranslation} from 'components/i18n/i18n-translation';
import {logEvent} from 'components/log/log-helper';
import {Navigators} from 'components/navigation';
import {notify, notifyError} from 'components/notification/notification';
import {openByUrlDetector} from 'components/open-url-handler/open-url-handler';
import {SET_DRAFT_COMMENT_DATA, SET_PROGRESS} from './action-types';
import {setApi} from 'components/api/api__instance';

import type {Activity} from 'types/Activity';
import type {AppConfig, EndUserAgreement} from 'types/AppConfig';
import type {AppState} from 'reducers';
import type {Article} from 'types/Article';
import type {AuthParams} from 'types/Auth';
import type {CustomError} from 'types/Error';
import type {
  Folder,
  User,
  UserAppearanceProfile,
  UserArticlesProfile,
  UserCurrent,
} from 'types/User';
import type {InboxFolder, InboxThread} from 'types/Inbox';
import type {NetInfoState} from '@react-native-community/netinfo';
import type {NotificationRouteData} from 'types/Notification';
import type {PermissionCacheItem} from 'types/Permission';
import type {StorageState} from 'components/storage/storage';
import type {WorkTimeSettings} from 'types/Work';
import {AnyIssue} from 'types/Issue';
import {DraftCommentData, IssueComment} from 'types/CustomFields';
import {GlobalSettings} from 'types/GlobalSettings';
import {ReduxAction, ReduxStateGetter, ReduxAPIGetter, ReduxThunkDispatch} from 'types/Redux';
import {UserGeneralProfileLocale} from 'types/User';

export function setNetworkState(networkState: NetInfoState): ReduxAction {
  return async (dispatch: ReduxThunkDispatch) => {
    dispatch({
      type: types.SET_NETWORK,
      networkState,
    });
  };
}

export function logOut(): ReduxAction {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter) => {
    const auth = getState().app.auth;
    if (auth) {
      auth.logOut();
    }
    storage.clearStorage();

    setApi(null);
    dispatch({
      type: types.LOG_OUT,
    });
    log.info('User is logged out');
  };
}

export function openDebugView() {
  return {
    type: types.OPEN_DEBUG_VIEW,
  };
}

export function closeDebugView() {
  return {
    type: types.CLOSE_DEBUG_VIEW,
  };
}

export function receiveOtherAccounts(otherAccounts: StorageState[]) {
  return {
    type: types.RECEIVE_OTHER_ACCOUNTS,
    otherAccounts,
  };
}

export function receiveUserAppearanceProfile(userAppearanceProfile?: UserAppearanceProfile): ReduxAction {
  return async (
    dispatch: ReduxThunkDispatch,
    getState: ReduxStateGetter,
    getApi: ReduxAPIGetter,
  ) => {
    if (userAppearanceProfile) {
      try {
        const appearanceProfile: UserAppearanceProfile = await getApi().user.updateUserAppearanceProfile(
          'me',
          userAppearanceProfile,
        );
        dispatch({
          type: types.RECEIVE_USER_APPEARANCE_PROFILE,
          ...{
            appearance: appearanceProfile,
          },
        });
      } catch (error) {
        log.info('Can\'t update user appearance profile.');
      }
    }
  };
}

export const updateUserArticlesProfile = (
  articlesProfile: UserArticlesProfile | { lastVisitedArticle: null },
): ReduxAction => async (
  dispatch: ReduxThunkDispatch,
) => {
  dispatch({
    type: types.RECEIVE_USER_ARTICLES_PROFILE,
    ...{
      articles: articlesProfile,
    },
  });
};

export const resetUserArticlesProfile = (): ReduxAction => async (dispatch: ReduxThunkDispatch) => {
  dispatch(
    updateUserArticlesProfile({
      lastVisitedArticle: null,
    }),
  );
};

export const cacheUserLastVisitedArticle = (
  article: Article | null,
  activities?: Activity[],
) => {
  try {
    if (!article || !article.id) {
      storage.flushStoragePart({
        articleLastVisited: null,
      });
    } else {
      const articleLastVisited: {
        article?: Article;
        activities?: Activity[];
      } | null = storage.getStorageState().articleLastVisited;
      storage.flushStoragePart({
        articleLastVisited: {
          ...{
            article,
          },
          activities:
            activities ||
            (articleLastVisited?.article?.id === article.id
              ? articleLastVisited?.activities
              : null),
        },
      });
    }
  } catch (e) {
    logEvent({
      message: 'Failed to store locally the last visited article',
      isError: true,
    });
  }
};

export function loadCurrentUserAndSetAPI(): ReduxAction {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter) => {
    if (getState().app?.networkState?.isConnected === true) {
      const auth: OAuth2 = getState().app.auth as OAuth2;
      const authParams = auth.getAuthParams();
      await auth.loadCurrentUser(authParams);
      await storage.flushStoragePart({
        currentUser: {...storage.getStorageState().currentUser, ...auth.currentUser},
      });
      setApi(new Api(auth));
    }
  };
}

function setAuthInstance(auth: OAuth2) {
  return {
    type: types.INITIALIZE_AUTH,
    auth,
  };
}

async function createAuthInstance(config: AppConfig): Promise<OAuth2> {
  const auth: OAuth2 = new OAuth2(config);
  usage.init(config.statisticsEnabled);
  return auth;
}

function showUserAgreement(agreement: Agreement) {
  usage.trackEvent('EUA is shown');
  return {
    type: types.SHOW_USER_AGREEMENT,
    agreement,
  };
}

async function storeConfig(config: AppConfig) {
  await storage.flushStoragePart({
    config,
  });
}

function populateAccounts(): ReduxAction {
  return async (dispatch: ReduxThunkDispatch) => {
    const otherAccounts: StorageState[] = await storage.getOtherAccounts();
    dispatch(receiveOtherAccounts(otherAccounts));
  };
}

function beginAccountChange() {
  return {
    type: types.BEGIN_ACCOUNT_CHANGE,
  };
}

function endAccountChange() {
  return {
    type: types.END_ACCOUNT_CHANGE,
  };
}

export function activateAccount(
  nextAccount: StorageState,
  removeCurrentAccount: boolean = false,
): ReduxAction<Promise<StorageState[]>> {
  return async (
    dispatch: ReduxThunkDispatch,
    getState: ReduxStateGetter,
  ) => {
    const state: AppState = getState();
    const currentAccount: StorageState = storage.getStorageState();
    log.info(
      `Changing account: ${currentAccount?.config?.backendUrl || ''} -> ${
        nextAccount?.config?.backendUrl || ''
      }`,
    );
    const otherAccounts: StorageState[] = (state.app.otherAccounts || []).filter(
      (it: StorageState) => it.creationTimestamp !== nextAccount.creationTimestamp,
    );
    const prevAccount = removeCurrentAccount ? null : currentAccount;
    const updatedOtherAccounts = [
      ...(prevAccount && currentAccount !== nextAccount ? [prevAccount] : []),
      ...otherAccounts,
    ];
    dispatch(receiveOtherAccounts(updatedOtherAccounts));
    await storage.storeAccounts(updatedOtherAccounts);

    await storage.flushStorage(nextAccount);
    return otherAccounts;
  };
}

export function changeAccount(
  account: StorageState,
  removeCurrentAccount: boolean,
): ReduxAction {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter) => {
    const state: AppState = getState();
    const config = account.config as AppConfig;
    const authParams: AuthParams | null = await getStoredSecurelyAuthParams(account.authParamsKey);

    if (!authParams) {
      const errorMessage: string = i18n(
        'The selected account is no longer authorized to use YouTrack Mobile. Please log in again.',
      );
      notify(errorMessage);
      throw new Error(errorMessage);
    }

    dispatch(beginAccountChange());

    try {
      const userLocale: UserGeneralProfileLocale | null | undefined =
        account.currentUser?.ytCurrentUser?.profiles?.general?.locale;

      if (userLocale) {
        loadTranslation(userLocale?.locale, userLocale?.language);
      }

      await dispatch(activateAccount(account, removeCurrentAccount));
      await dispatch(loadCurrentUserAndSetAPI());
      await storeConfig(config);
      await dispatch(checkUserAgreement());
      await dispatch(applyGlobalSettings());

      if (!state.app.showUserAgreement) {
        dispatch(completeInitialization());
      }

      log.info('Account changed, URL:', account?.config?.backendUrl);
    } catch (err) {
      notifyError(err as CustomError);
      throw err;
    }

    dispatch(endAccountChange());
  };
}

export function removeAccountOrLogOut(): ReduxAction {
  return async (
    dispatch: ReduxThunkDispatch,
    getState: ReduxStateGetter,
    getApi: ReduxAPIGetter,
  ) => {
    const otherAccounts: StorageState[] = getState().app.otherAccounts || [];

    if (isRegisteredForPush()) {
      setRegisteredForPush(false);

      try {
        await PushNotifications.unregister();
      } catch (err) {
        log.warn('Failed to unsubscribe from push notifications', err);
      }
    }

    await getApi().user.logout();
    dispatch(logOut());
    await storage.clearStorage();

    log.info('Logging out from the curren account');
    if (otherAccounts.length > 0) {
      log.info('Switching an account');
      await dispatch(changeAccount(otherAccounts[0], true));
    } else {
      Router.EnterServer();
    }
  };
}

function setUserPermissions(permissions: PermissionCacheItem[]): ReduxAction {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter) => {
    dispatch({
      type: types.SET_PERMISSIONS,
      permissionsStore: new PermissionsStore(permissions),
      currentUser: {
        ...getState().app?.auth?.currentUser,
        ...storage.getStorageState().currentUser,
      },
    });
  };
}

export function loadUserPermissions(): ReduxAction {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter) => {
    const auth: OAuth2 = getState().app.auth as OAuth2;

    try {
      const permissions: PermissionCacheItem[] = await appActionsHelper.loadPermissions(
        auth.getTokenType(),
        auth.getAccessToken(),
        auth.getPermissionsCacheURL(),
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

export function setTranslation(): ReduxAction {
  return async (
    dispatch: ReduxThunkDispatch,
  ) => {
    log.debug('Setting translation');
    const cachedCurrentUser: UserCurrent | null | undefined = storage.getStorageState()?.currentUser?.ytCurrentUser;
    const cachedLocale: UserGeneralProfileLocale | null | undefined = cachedCurrentUser?.profiles?.general?.locale;
    const currentUser: UserCurrent = await dispatch(loadYTCurrentUser());
    const userProfileLocale: UserGeneralProfileLocale | null | undefined = currentUser?.profiles?.general?.locale;
    const isLanguageChanged: boolean = !cachedLocale?.language || (
      !!cachedLocale?.language &&
      !!userProfileLocale?.language &&
      cachedLocale?.language !== userProfileLocale?.language
    );

    if (isLanguageChanged && userProfileLocale?.language) {
      loadTranslation(userProfileLocale?.locale, userProfileLocale?.language);
    }
  };
}

export function completeInitialization(): ReduxAction {
  return async (dispatch: ReduxThunkDispatch) => {
    log.debug('Completing initialization');
    dispatch(setTranslation());
    await dispatch(loadUserPermissions());
    await dispatch(cacheProjects());
    log.debug('Initialization completed');
    navigator.replace(Navigators.BottomTabs, {screen: Navigators.IssuesRoot});
    dispatch(loadWorkTimeSettings());
    dispatch(subscribeToPushNotifications());
    if (checkVersion(FEATURE_VERSION.inboxThreads)) {
      dispatch(inboxCheckUpdateStatus());
    }
  };
}

export function setYTCurrentUser(user: User): ReduxAction {
  return async (dispatch: ReduxThunkDispatch) => {
    await dispatch({
      type: types.RECEIVE_USER,
      user,
    });
    await storeYTCurrentUser(user);
  };
}

export function loadYTCurrentUser(): ReduxAction<Promise<UserCurrent>> {
  return async (
    dispatch: ReduxThunkDispatch,
    getState: ReduxStateGetter,
    getApi: ReduxAPIGetter,
  ) => {
    const user: User = await getApi().user.getUser();
    await dispatch(setYTCurrentUser(user));
    return user;
  };
}

function loadWorkTimeSettings(): ReduxAction {
  return async (
    dispatch: ReduxThunkDispatch,
    getState: ReduxStateGetter,
    getApi: ReduxAPIGetter,
  ) => {
    try {
      const workTimeSettings: WorkTimeSettings = await getApi().getWorkTimeSettings();
      await dispatch({
        type: types.RECEIVE_WORK_TIME_SETTINGS,
        workTimeSettings,
      });
    } catch (error) {
      notifyError(error as CustomError);
    }
  };
}

export function acceptUserAgreement(): ReduxAction {
  return async (
    dispatch: ReduxThunkDispatch,
    getState: ReduxStateGetter,
    getApi: ReduxAPIGetter,
  ) => {
    log.info('User agreement accepted');
    usage.trackEvent('EUA is accepted');
    const api: Api = getApi();
    try {
      await api.acceptUserAgreement();
      dispatch(completeInitialization());
    } catch (e) {
      dispatch(removeAccountOrLogOut());
    } finally {
      dispatch({type: types.HIDE_USER_AGREEMENT});
    }
  };
}

export function declineUserAgreement(): ReduxAction {
  return async (dispatch: ReduxThunkDispatch) => {
    log.info('User agreement declined');
    usage.trackEvent('EUA is declined');
    dispatch({
      type: types.HIDE_USER_AGREEMENT,
    });
    dispatch(removeAccountOrLogOut());
  };
}

export function initializeAuth(config: AppConfig): ReduxAction {
  return async (dispatch: ReduxThunkDispatch) => {
    const auth: OAuth2 = await createAuthInstance(config);
    dispatch(setAuthInstance(auth));
    await auth.setAuthParamsFromCache();
    return auth;
  };
}

type Agreement = | EndUserAgreement | null | undefined;

function checkUserAgreement(): ReduxAction {
  return async (
    dispatch: ReduxThunkDispatch,
    getState: ReduxStateGetter,
    getApi: ReduxAPIGetter,
  ) => {
    const api: Api = getApi();
    const auth: OAuth2 = getState().app.auth as OAuth2;
    const currentUser: UserCurrent | null = auth.currentUser;
    log.debug('Checking user agreement', currentUser);

    if (currentUser?.endUserAgreementConsent?.accepted) {
      log.info('The EUA already accepted, skip check');
      return;
    }

    const agreement: Agreement = await api.getUserAgreement();

    if (!agreement) {
      log.debug('EUA is not supported, skip check');
      return;
    }

    if (!agreement.enabled) {
      log.debug('EUA is disabled, skip check');
      return;
    }

    log.info(
      'User agreement should be accepted',
      {...agreement, text: 'NOT_PRINTED'},
      currentUser,
    );
    dispatch(showUserAgreement(agreement));
  };
}

export function onLogIn(authParams: AuthParams, config: AppConfig, currentAccount?: StorageState): ReduxAction {
  return async (
    dispatch: ReduxThunkDispatch,
    getState: ReduxStateGetter,
  ) => {
    await storeConfig(config);

    const otherAccounts: StorageState[] = getState().app.otherAccounts || [];
    if (currentAccount) {
      const newOtherAccounts: StorageState[] = [...otherAccounts, currentAccount];
      await storage.storeAccounts(newOtherAccounts);
      dispatch(receiveOtherAccounts(newOtherAccounts));
    }

    const timestamp: number = Date.now();
    await storage.flushStoragePart({
      creationTimestamp: timestamp,
      [storage.storageStateAuthParamsKey]: timestamp.toString(),
    });

    const auth: OAuth2 = await createAuthInstance(config);
    await dispatch(setAuthInstance(auth));
    await auth.cacheAuthParams(authParams, timestamp.toString());
    auth.setAuthParams(authParams);

    await dispatch(loadCurrentUserAndSetAPI());
    await dispatch(checkUserAgreement());

    if (!getState().app.showUserAgreement) {
      dispatch(completeInitialization());
    }
  };
}

export function cacheProjects(): ReduxAction<Promise<Folder[]>> {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
    const [error, userFolders] = await until<Folder[]>(
      getApi().user.getUserFolders('', ['$type,id,shortName,name,pinned'])
    );
    const projects: Folder[] = error ? [] : userFolders.filter(it => hasType.project(it));
    await storage.flushStoragePart({projects});
    return projects;
  };
}

export function subscribeToURL(): ReduxAction {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
    openByUrlDetector(
      async (url: string, issueId?: string, articleId?: string) => {
        if (isAuthorized()) {
          usage.trackEvent('app', 'Open issue in app by URL');
          navigateTo(url, issueId, articleId);
        }
      },
      async (url: string, searchQuery: string) => {
        if (isAuthorized()) {
          usage.trackEvent('app', 'Open issues query in app by URL');
          navigateTo(url, undefined, undefined, searchQuery);
        }
      }
    );

    function isAuthorized(): boolean {
      const isUserAuthorized = !!getState().app?.auth?.currentUser;
      if (!isUserAuthorized) {
        log.debug('User is not authorized, URL won\'t be opened');
      }
      return isUserAuthorized;
    }

    async function navigateTo(url: string, issueId?: string, articleId?: string, searchQuery?: string) {
      const backendUrl = getApi().config?.backendUrl;
      if (!backendUrl) {
        return;
      }
      if (url.indexOf(backendUrl) === -1) {
        const serverURL = UrlParse(url).origin || '';
        const account = await targetAccountToSwitchTo(serverURL);
        if (account) {
          await dispatch(changeAccount(account, false, issueId, articleId, undefined, searchQuery));
        }
      } else {
        const navigateToActivity: string | undefined = url.split('#focus=Comments-')?.[1];
        if (issueId) {
          Router.Issue({issueId, navigateToActivity}, {forceReset: true});
        } else if (articleId) {
          Router.Article({articlePlaceholder: {id: articleId}, navigateToActivity}, {forceReset: true});
        } else {
          Router.navigateToDefaultRoute({searchQuery});
        }
      }
    }
  };
}

export function migrateToIssuesFilterSearch(): (
  dispatch: (arg0: any) => any,
  getState: () => AppState,
  getApi: () => Api,
) => void {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: () => Api,
  ) => {
    const storageState: StorageState = storage.getStorageState();
    let shouldMigrate;
    try {
      const curAppVer = (storageState.currentAppVersion || '')?.split('.');
      const nextAppVer = packageJson.version.split('.');
      const curr = curAppVer.map(it => parseInt(it, 10));
      const next = nextAppVer.map(it => parseInt(it, 10));
      const isNextVerToMigrate: boolean = next[0] === 2023 && next[1] === 3 && next[2] === 1;
      shouldMigrate = (
        !storageState.currentAppVersion ||
        curr[0] < next[0] && isNextVerToMigrate ||
        curr[0] === next[0] && isNextVerToMigrate && curr[1] < 3
      );
    } catch (e) {
      shouldMigrate = false;
    }
    if (shouldMigrate) {
      const doUpdate = (it: StorageState): StorageState => ({...it, query: ''}) as StorageState;
      await storage.flushStorage(doUpdate(storageState));
      const otherAccounts: StorageState[] = await storage.getOtherAccounts();
      if (otherAccounts.length > 0) {
        const updatedOtherAccounts: StorageState[] = otherAccounts.map(doUpdate);
        await storage.storeAccounts(updatedOtherAccounts);
        dispatch(receiveOtherAccounts(updatedOtherAccounts));
      }
    }
  };
}

async function refreshConfig(backendUrl: string): Promise<AppConfig> {
  const updatedConfig: AppConfig = await doConnect(backendUrl);
  await storeConfig(updatedConfig);
  await storage.flushStoragePart({
    currentAppVersion: packageJson.version,
  });
  return updatedConfig;
}

export function applyGlobalSettings(): ReduxAction {
  return async (
    dispatch: ReduxThunkDispatch,
    getState: ReduxStateGetter,
    getApi: ReduxAPIGetter,
  ) => {
    const [error, globalSettings] = await until<GlobalSettings>(getApi().globalSettings.getSettings());
    if (!error) {
      dispatch({
        type: types.SET_SETTINGS,
        globalSettings,
      });
    }
  };
}

export function initializeApp(
  config: AppConfig,
): ReduxAction {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter) => {
    const account: StorageState = storage.getStorageState();
    const cachedCurrentUser: User | undefined = account?.currentUser?.ytCurrentUser;
    if (cachedCurrentUser) {
      await dispatch(setYTCurrentUser(cachedCurrentUser));
    }

    const userProfileLocale: UserGeneralProfileLocale | undefined = cachedCurrentUser?.profiles?.general?.locale;
    if (userProfileLocale?.language) {
      loadTranslation(userProfileLocale.locale, userProfileLocale.language);
    }

    const hubCurrentUser: UserCurrent | null | undefined = account.currentUser;
    const ytCurrentUser: User | null | undefined = hubCurrentUser?.ytCurrentUser;
    if (ytCurrentUser) {
      await dispatch(setYTCurrentUser(ytCurrentUser));
    }

    const cachedPermissions: PermissionCacheItem[] | null = account.permissions;
    if (cachedPermissions) {
      await dispatch(setUserPermissions(cachedPermissions));
    }

    let configCurrent: AppConfig = config;
    const currentAppVersion: string | null | undefined = account.currentAppVersion;
    const versionHasChanged: boolean = currentAppVersion != null && packageJson.version !== currentAppVersion;

    await dispatch(migrateToIssuesFilterSearch());
    await createAPIInstance();
    await dispatch(applyGlobalSettings());

    storage.flushStoragePart({currentAppVersion: packageJson.version});

    try {
      if (versionHasChanged) {
        log.info(`App upgraded to "${packageJson.version}"; reloading config`);
        configCurrent = await refreshConfig(config.backendUrl);
      }
      const auth: OAuth2 = await dispatch(initializeAuth(configCurrent));
      await dispatch(loadCurrentUserAndSetAPI(auth));

    } catch (error) {
      Router.LogIn({
        config,
        errorMessage: getErrorMessage(error as CustomError),
      });
      return;
    }

    await dispatch(checkUserAgreement());
    if (!getState().app.showUserAgreement) {
      await dispatch(completeInitialization());
    }

    dispatch(subscribeToURL());

    if (!versionHasChanged) {
      refreshConfig(configCurrent.backendUrl);
    }

    async function createAPIInstance() {
      if (config) {
        try {
          const auth: OAuth2 = await createAuthInstance(config);
          dispatch(setAuthInstance(auth));
          setApi(new Api(auth));
        } catch (e) {
          Router.EnterServer({serverUrl: config.backendUrl});
        }
      }
    }
  };
}

export async function doConnect(newURL: string): Promise<any> {
  return await loadConfig(newURL);
}

export function connectToNewYoutrack(newURL: string, currentAccount?: StorageState): ReduxAction {
  return async (dispatch: ReduxThunkDispatch) => {
    const config = await doConnect(newURL);
    await storeConfig(config);
    const auth: OAuth2 = await createAuthInstance(config);
    dispatch(setAuthInstance(auth));
    Router.LogIn({
      config,
      currentAccount,
    });
  };
}

export function setAccount(notificationRouteData: NotificationRouteData = {}): ReduxAction {
  return async (dispatch: ReduxThunkDispatch) => {
    const state: StorageState = await storage.populateStorage();
    await dispatch(populateAccounts());
    const notificationBackendUrl: string | null | undefined = notificationRouteData?.backendUrl;

    if (
      notificationBackendUrl &&
      state?.config &&
      notificationBackendUrl !== state.config?.backendUrl
    ) {
      const notificationIssueAccount:
        | StorageState
        | null = await appActionsHelper.targetAccountToSwitchTo(notificationBackendUrl);

      if (notificationIssueAccount) {
        await dispatch(activateAccount(notificationIssueAccount));
        storage.flushStoragePart({
          config: notificationIssueAccount.config,
        });
      }
    }

    const targetConfig: AppConfig | null | undefined = storage.getStorageState().config;

    if (targetConfig) {
      dispatch(
        initializeApp(targetConfig),
      );
    } else {
      log.info('App is not configured, entering server URL');

      const navigateTo = (serverUrl: string | null) => {
        Router.EnterServer({serverUrl});
      };
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

export function subscribeToPushNotifications(): ReduxAction {
  return async (dispatch: ReduxThunkDispatch) => {
    if (await DeviceInfo.isEmulator()) {
      return;
    }

    PushNotificationsProcessor.init();

    const onSwitchAccount = async (account: StorageState) => {
      await dispatch(changeAccount(account, false));
    };

    if (isRegisteredForPush()) {
      log.info(
        'Device was already registered for push notifications. Initializing.',
      );
      PushNotifications.initialize(onSwitchAccount);
      return;
    }

    if (isAndroidPlatform() && Platform.Version >= 33) {
      try {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          await doSubscribe(onSwitchAccount);
          log.info('Push notifications permission granted');
        } else {
          log.warn('Push notifications permission is not allowed');
        }
      } catch (err) {
        log.warn(err);
      }
    } else {
      await doSubscribe(onSwitchAccount);
    }
  };
}

async function doSubscribe(onSwitchAccount: (account: StorageState, issueId?: string, articleId?: string) => any) {
  try {
    await PushNotifications.register();
    PushNotifications.initialize(onSwitchAccount);
    setRegisteredForPush(true);
  } catch (err) {
    notifyError(err as CustomError);
  }
}

function isRegisteredForPush(): boolean {
  //TODO: YTM-1267
  const storageState: StorageState = storage.getStorageState();
  return isIOSPlatform()
    ? storageState.isRegisteredForPush
    : Boolean(storageState.deviceToken);
}

function setRegisteredForPush(isRegistered: boolean) {
  if (isIOSPlatform()) {
    //TODO: also use device token
    storage.flushStoragePart({
      isRegisteredForPush: isRegistered,
    });
  }
}

function receiveInboxUpdateStatus(
  inboxThreadsFolders: InboxFolder[],
): {
  type: string;
  inboxThreadsFolders: InboxFolder[];
} {
  return {
    type: types.INBOX_THREADS_FOLDERS,
    inboxThreadsFolders,
  };
}

const getFirstCachedThread = (): InboxThread | null => {
  const inboxThreadsCache: storage.InboxThreadsCache | null = storage.getStorageState()?.inboxThreadsCache;
  return inboxThreadsCache?.[folderIdAllKey]?.[0] || null;
};

const inboxCheckUpdateStatus = (): ReduxAction => {
  return async (
    dispatch: ReduxThunkDispatch,
    getState: ReduxStateGetter,
    getApi: ReduxAPIGetter,
  ) => {
    if (getState().app?.networkState?.isConnected === true) {
      const firstCachedThread:
        | InboxThread
        | null
        | undefined = getFirstCachedThread();
      const [error, folders]: [CustomError | null, InboxFolder[]] = await until(
        getApi().inbox.getFolders(
          typeof firstCachedThread?.notified === 'number'
            ? firstCachedThread?.notified + 1
            : undefined,
        ),
      ) as [CustomError | null, InboxFolder[]];

      if (!error && Array.isArray(folders)) {
        const sorted: InboxFolder[] = folders.reduce(
          (flds: InboxFolder[], folder: InboxFolder) => {
            if (folder.id === folderIdMap[2]) {
              flds.push(folder);
            }

            if (folder.id === folderIdMap[1]) {
              flds.unshift(folder);
            }

            return flds;
          },
          [],
        );
        dispatch(receiveInboxUpdateStatus(sorted));
      }
    }
  };
};

const setGlobalInProgress = (isInProgress: boolean) => ({
  type: SET_PROGRESS,
  isInProgress,
});

export function setDraftCommentData(
  setDraft: Function,
  getCommentDraft: () => ReduxAction<Promise<IssueComment | null>>,
  entity: AnyIssue | Article
) {
  return {
    entity,
    getCommentDraft,
    setDraft,
    type: SET_DRAFT_COMMENT_DATA,
  };
}

const addMentionToDraftComment = (userLogin: string): ReduxAction => {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter) => {
    if (getState().app?.networkState?.isConnected !== true) {
      return;
    }

    try {
      const draftData: DraftCommentData = await getState().app.draftCommentData;
      if (draftData.getCommentDraft && draftData.setDraft) {
        const commentDraft: IssueComment | null = await dispatch(draftData.getCommentDraft());
        const draftText: string = commentDraft?.text ? `${commentDraft.text}\n\n` : '';
        const text: string = `${draftText}@${userLogin} `;
        dispatch(
          draftData.setDraft({
            ...commentDraft,
            text,
          }, false)
        );
      }
    } catch (e) {
    }
  };
};

export {
  addMentionToDraftComment,
  inboxCheckUpdateStatus,
  setGlobalInProgress,
};
