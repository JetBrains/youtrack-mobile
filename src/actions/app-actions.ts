import {Linking} from 'react-native';

import DeviceInfo from 'react-native-device-info';
import UrlParse from 'url-parse';

import * as appActionsHelper from './app-actions-helper';
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
import {getCachedPermissions, storeYTCurrentUser} from './app-actions-helper';
import {getErrorMessage} from 'components/error/error-resolver';
import {getStoredSecurelyAuthParams} from 'components/storage/storage__oauth';
import {hasType} from 'components/api/api__resource-types';
import {i18n} from 'components/i18n/i18n';
import {isIOSPlatform, until} from 'util/util';
import {isSplitView} from 'components/responsive/responsive-helper';
import {loadConfig} from 'components/config/config';
import {loadTranslation} from 'components/i18n/i18n-translation';
import {logEvent} from 'components/log/log-helper';
import {normalizeAuthParams} from 'components/auth/oauth2-helper';
import {notify, notifyError} from 'components/notification/notification';
import {openByUrlDetector} from 'components/open-url-handler/open-url-handler';
import {SET_DRAFT_COMMENT_DATA, SET_PROGRESS} from './action-types';
import {setApi} from 'components/api/api__instance';

import type {Activity} from 'types/Activity';
import type {AppConfig, EndUserAgreement} from 'types/AppConfig';
import type {AppState} from 'reducers';
import type {Article} from 'types/Article';
import type {AuthParams, OAuthParams2} from 'types/Auth';
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
import {DraftCommentData, IssueComment} from 'types/CustomFields';
import {UserGeneralProfileLocale} from 'types/User';
import {AnyIssue} from 'types/Issue';

type Action = (dispatch: (arg0: any) => any, getState: () => AppState, getApi: () => Api) => Promise<any>;

export function setNetworkState(networkState: NetInfoState): Action {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: () => Api,
  ) => {
    dispatch({
      type: types.SET_NETWORK,
      networkState,
    });
  };
}
export function logOut(): Action {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: () => Api,
  ) => {
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
export function openDebugView(): {
  type: string;
} {
  return {
    type: types.OPEN_DEBUG_VIEW,
  };
}
export function closeDebugView(): {
  type: string;
} {
  return {
    type: types.CLOSE_DEBUG_VIEW,
  };
}
export function setEnabledFeatures(
  features: string[],
): {
  features: string[];
  type: string;
} {
  return {
    type: types.SET_FEATURES,
    features,
  };
}
export function onNavigateBack(
  closingView: Record<string, any>,
): {
  closingView: any;
  type: string;
} {
  return {
    type: types.ON_NAVIGATE_BACK,
    closingView,
  };
}
export function receiveOtherAccounts(
  otherAccounts: StorageState[],
): {
  otherAccounts: StorageState[];
  type: string;
} {
  return {
    type: types.RECEIVE_OTHER_ACCOUNTS,
    otherAccounts,
  };
}
export function receiveUserAppearanceProfile(
  userAppearanceProfile?: UserAppearanceProfile,
): Action {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: () => Api,
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
  articlesProfile:
    | UserArticlesProfile
    | {
        lastVisitedArticle: null;
      },
): Action => async (
  dispatch: (arg0: any) => any,
  getState: () => AppState,
  getApi: () => Api,
) => {
  dispatch({
    type: types.RECEIVE_USER_ARTICLES_PROFILE,
    ...{
      articles: articlesProfile,
    },
  });
};
export const resetUserArticlesProfile = (): Action => async (
  dispatch: (arg0: any) => any,
  getState: () => AppState,
  getApi: () => Api,
) => {
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
export function loadCurrentUserAndSetAPI(): Action {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: () => Api,
  ) => {
    if (getState().app?.networkState?.isConnected === true) {
      const auth: OAuth2 = (getState().app.auth as any) as OAuth2;
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

  try {
    await auth.setAuthParamsFromCache();
  } catch (e) {}

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

function populateAccounts() {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: () => Api,
  ) => {
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

async function connectToOneMoreServer(
  serverUrl: string,
  onBack: (...args: any[]) => any,
): Promise<AppConfig> {
  return new Promise(resolve => {
    Router.EnterServer({
      onCancel: onBack,
      serverUrl,
      connectToYoutrack: async (newURL: string) =>
        resolve(await doConnect(newURL)),
    });
  });
}

async function authorizeOnOneMoreServer(
  config: AppConfig,
  onBack: (serverUrl: string) => any,
): Promise<OAuthParams2> {
  return new Promise(resolve => {
    Router.LogIn({
      config,
      onChangeServerUrl: onBack,
      onLogIn: (authParams: OAuthParams2) => resolve(authParams),
    });
  });
}

function applyAccount(
  config: AppConfig,
  auth: OAuth2,
  authParams: OAuthParams2,
): Action {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: () => Api,
  ) => {
    const otherAccounts: StorageState[] =
      getState().app.otherAccounts || [];
    const currentAccount: StorageState = storage.getStorageState();
    const newOtherAccounts: StorageState[] = [
      currentAccount,
      ...otherAccounts,
    ];
    await storage.storeAccounts(newOtherAccounts);
    dispatch(receiveOtherAccounts(newOtherAccounts));
    const creationTimestamp: number = Date.now();
    await storage.flushStorage({
      ...storage.initialState,
      creationTimestamp: creationTimestamp,
      [storage.storageStateAuthParamsKey]: creationTimestamp.toString(),
    } as StorageState);
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
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: () => Api,
  ) => {
    log.info('Adding new account started');

    try {
      const config: AppConfig = await connectToOneMoreServer(serverUrl, () => {
        log.info('Adding new server canceled by user');
        Router.navigateToDefaultRoute();
      });
      log.info(
        `Config loaded for new server (${config.backendUrl}), logging in...`,
      );
      const tmpAuthInstance: OAuth2 = new OAuth2(config); //NB! this temporary instance for Login screen code

      const authParams: OAuthParams2 = await authorizeOnOneMoreServer(
        config,
        function onBack(url: string) {
          log.info('Authorization canceled by user, going back');
          dispatch(addAccount(url));
        },
      );
      log.info('Authorized on new server, applying');
      await dispatch(
        applyAccount(config, tmpAuthInstance, normalizeAuthParams(authParams)),
      );
      const user: User | null | undefined = storage.getStorageState().currentUser;
      const userName: string = user?.name || '';
      log.info(
        `Successfully added account, user "${userName}", server "${config.backendUrl}"`,
      );
    } catch (err) {
      notifyError(err as CustomError);
      const {otherAccounts} = getState().app;

      if (!storage.getStorageState().config && otherAccounts?.length) {
        log.info('Restoring prev account');
        await dispatch(switchAccount(otherAccounts[0], true));
      }

      Router.navigateToDefaultRoute();
    }
  };
}
export function switchAccount(
  account: StorageState,
  dropCurrentAccount: boolean = false,
  issueId?: string,
): Action {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: () => Api,
  ) => {
    dispatch(resetUserArticlesProfile());
    cacheUserLastVisitedArticle(null);

    try {
      redirectToHome(account.config?.backendUrl);
      await dispatch(changeAccount(account, dropCurrentAccount, issueId));
    } catch (e) {}
  };
}
export function updateOtherAccounts(
  account: StorageState,
  removeCurrentAccount: boolean = false,
): (
  dispatch: (arg0: any) => any,
  getState: () => AppState,
  getApi: () => Api,
) => Promise<Array<StorageState>> {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: () => Api,
  ) => {
    const state: AppState = getState();
    const currentAccount: StorageState = storage.getStorageState();
    log.info(
      `Changing account: ${currentAccount?.config?.backendUrl || ''} -> ${
        account?.config?.backendUrl || ''
      }`,
    );
    const otherAccounts: StorageState[] = (
      state.app.otherAccounts || []
    ).filter(
      (it: StorageState) => it.creationTimestamp !== account.creationTimestamp,
    );
    const prevAccount = removeCurrentAccount ? null : currentAccount;
    const updatedOtherAccounts = [
      ...(prevAccount && currentAccount !== account ? [prevAccount] : []),
      ...otherAccounts,
    ];
    await storage.storeAccounts(updatedOtherAccounts);
    await storage.flushStorage(account);
    dispatch(receiveOtherAccounts(updatedOtherAccounts));
    return otherAccounts;
  };
}
export function changeAccount(
  account: StorageState,
  removeCurrentAccount: boolean,
  issueId: string | null | undefined,
): Action {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
  ) => {
    const state: AppState = getState();
    const config: AppConfig = (account.config as any) as AppConfig;
    const authParams: AuthParams | null = await getStoredSecurelyAuthParams(account.authParamsKey);

    if (!authParams) {
      const errorMessage: string = i18n(
        'The selected account is no longer authorized to use YouTrack Mobile. Please log in again.',
      );
      notify(errorMessage);
      throw new Error(errorMessage);
    }

    const auth: OAuth2 = new OAuth2(config);
    dispatch(beginAccountChange());

    try {
      const userLocale: UserGeneralProfileLocale | null | undefined =
        account.currentUser?.ytCurrentUser?.profiles?.general?.locale;

      if (userLocale) {
        loadTranslation(userLocale?.locale, userLocale?.language);
      }

      await dispatch(updateOtherAccounts(account, removeCurrentAccount));
      await auth.cacheAuthParams(
        authParams as any,
        account.authParamsKey ||
          ((account.creationTimestamp as any) as number).toString(),
      );
      await storeConfig(config);
      await dispatch(initializeAuth(config));
      await dispatch(checkUserAgreement());

      if (!state.app.showUserAgreement) {
        dispatch(completeInitialization(issueId));
      }

      log.info('Account changed, URL:', account?.config?.backendUrl);
    } catch (err) {
      notifyError(err as CustomError);
      throw err;
    }

    dispatch(endAccountChange());
  };
}
export function removeAccountOrLogOut(): Action {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: () => Api,
  ) => {
    const otherAccounts: StorageState[] =
      getState().app.otherAccounts || [];

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
      redirectToHome(otherAccounts[0].config?.backendUrl);
      await dispatch(switchAccount(otherAccounts[0], true));
    } else {
      Router.EnterServer();
    }
  };
}

function setUserPermissions(permissions: PermissionCacheItem[]): Action {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: () => Api,
  ) => {
    dispatch({
      type: types.SET_PERMISSIONS,
      permissionsStore: new PermissionsStore(permissions),
      currentUser:
        getState().app?.auth?.currentUser || storage.getStorageState().currentUser,
    });
  };
}

export function loadUserPermissions(): Action {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: () => Api,
  ) => {
    const auth: OAuth2 = (getState().app.auth as any) as OAuth2;

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
export function completeInitialization(
  issueId: string | null = null,
  navigateToActivity: boolean = false,
  skipNavigateToRoute: boolean = false,
): Action {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: () => Api,
  ) => {
    log.debug('Completing initialization');
    const cachedCurrentUser: UserCurrent | null | undefined = storage.getStorageState()
      ?.currentUser?.ytCurrentUser;
    const cachedLocale: UserGeneralProfileLocale | null | undefined =
      cachedCurrentUser?.profiles?.general?.locale;
    const currentUser: UserCurrent = await dispatch(loadYTCurrentUser());
    const userProfileLocale: UserGeneralProfileLocale | null | undefined =
      currentUser?.profiles?.general?.locale;
    const isLanguageChanged: boolean = !cachedLocale?.language || (
      !!cachedLocale?.language &&
      !!userProfileLocale?.language &&
      cachedLocale?.language !== userProfileLocale?.language
    );

    if (isLanguageChanged && userProfileLocale?.language) {
      loadTranslation(userProfileLocale?.locale, userProfileLocale?.language);

      if (!issueId) {
        redirectToHome(storage.getStorageState()?.config?.backendUrl);
      }
    }

    await dispatch(loadUserPermissions());
    await dispatch(cacheProjects());
    log.debug('Initialization completed');

    if (!skipNavigateToRoute || (isLanguageChanged && !issueId)) {
      Router.navigateToDefaultRoute(
        issueId
          ? {
              issueId,
              navigateToActivity,
            }
          : null,
      );
    }

    dispatch(loadWorkTimeSettings());
    dispatch(subscribeToPushNotifications());
    if (checkVersion(FEATURE_VERSION.inboxThreads)) {
      dispatch(inboxCheckUpdateStatus());
    }
  };
}
export function setYTCurrentUser(user: User): Action {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: () => Api,
  ): Promise<void> => {
    await dispatch({
      type: types.RECEIVE_USER,
      user,
    });
    await storeYTCurrentUser(user);
  };
}
export function loadYTCurrentUser(): Action {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: () => Api,
  ) => {
    const user: User = await getApi().user.getUser();
    await dispatch(setYTCurrentUser(user));
    return user;
  };
}

function loadWorkTimeSettings(): Action {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: () => Api,
  ) => {
    try {
      const workTimeSettings: WorkTimeSettings = await getApi().getWorkTimeSettings();
      await dispatch({
        type: types.RECEIVE_WORK_TIME_SETTINGS,
        workTimeSettings,
      });
    } catch (error) {
      notifyError(error);
    }
  };
}

export function acceptUserAgreement(): Action {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: () => Api,
  ) => {
    log.info('User agreement accepted');
    usage.trackEvent('EUA is accepted');
    const api: Api = getApi();
    await api.acceptUserAgreement();
    dispatch({
      type: types.HIDE_USER_AGREEMENT,
    });
    dispatch(completeInitialization());
  };
}
export function declineUserAgreement(): Action {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: () => Api,
  ) => {
    log.info('User agreement declined');
    usage.trackEvent('EUA is declined');
    dispatch({
      type: types.HIDE_USER_AGREEMENT,
    });
    dispatch(removeAccountOrLogOut());
  };
}
export function initializeAuth(config: AppConfig): Action {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: () => Api,
  ) => {
    const auth: OAuth2 = await createAuthInstance(config);
    dispatch(setAuthInstance(auth));
    await dispatch(loadCurrentUserAndSetAPI());
  };
}

type Agreement = | EndUserAgreement | null | undefined;

function checkUserAgreement(): Action {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: () => Api,
  ): Promise<void> => {
    const api: Api = getApi();
    const auth: OAuth2 = (getState().app.auth as any) as OAuth2;
    const {currentUser} = auth;
    log.debug('Checking user agreement', currentUser);

    if (
      currentUser &&
      currentUser.endUserAgreementConsent &&
      currentUser.endUserAgreementConsent.accepted
    ) {
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

export function onLogIn(authParams: AuthParams): Action {
  return async (
    dispatch: (...args: any[]) => any,
    getState: () => AppState,
  ) => {
    const auth: OAuth2 | null = getState().app.auth;
    const creationTimestamp: number = Date.now();
    const authStorageStateValue: string = creationTimestamp.toString();
    await storage.flushStoragePart({
      creationTimestamp: creationTimestamp,
      [storage.storageStateAuthParamsKey]: authStorageStateValue,
    });

    if (auth && authParams) {
      auth.setAuthParams(authParams);
      await auth.cacheAuthParams(authParams as any, authStorageStateValue);
    }

    await dispatch(loadCurrentUserAndSetAPI());
    await dispatch(checkUserAgreement());

    if (!getState().app.showUserAgreement) {
      dispatch(completeInitialization());
    }
  };
}
export function cacheProjects(): (
  dispatch: (arg0: any) => any,
  getState: () => AppState,
  getApi: () => Api,
) => Promise<Array<Folder>> {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: () => Api,
  ) => {
    const userFolders: Folder[] = await getApi().user.getUserFolders('', [
      '$type,id,shortName,name,pinned',
    ]);
    const projects: Folder[] = userFolders.filter((it: Folder) =>
      hasType.project(it),
    );
    await storage.flushStoragePart({
      projects: projects,
    });
    return projects;
  };
}

export function subscribeToURL(): Action {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: () => Api,
  ) => {
    const onIdDetected = (url: string, issueId?: string, articleId?: string) => {
      if (!getIsAuthorized()) {
        log.debug('User is not authorized, URL won\'t be opened');
        return;
      }

      usage.trackEvent('app', 'Open issue in app by URL');
      const navigateToActivity: string | undefined = url.split('#focus=Comments-')?.[1];
      if (issueId) {
        Router.Issue({issueId, navigateToActivity}, {forceReset: true});
      } else if (articleId) {
        Router.Article({articlePlaceholder: {id: articleId}, navigateToActivity}, {forceReset: true});
      } else {
        Router.navigateToDefaultRoute();
      }
    };

    const onQueryDetected = (url: string, searchQuery: string) => {
      if (!getIsAuthorized()) {
        log.debug('User is not authorized, URL won\'t be opened');
        return;
      }

      usage.trackEvent('app', 'Open issues query in app by URL');
      Router.Issues({searchQuery});
    };

    openByUrlDetector(onIdDetected, onQueryDetected);

    function getIsAuthorized(): boolean {
      return !!getState().app?.auth?.currentUser;
    }
  };
}

export function redirectToRoute(
  config: AppConfig,
  issueId: string | null,
  navigateToActivity: boolean,
): Action {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: () => Api,
  ): Promise<boolean> => {
    let isRedirected: boolean = false;

    try {
      if (config) {
        const auth: OAuth2 = await createAuthInstance(config);
        dispatch(setAuthInstance(auth));
        setApi(new Api(auth));
        const cachedPermissions:
          | Array<PermissionCacheItem>
          | null
          | undefined = getCachedPermissions();

        if (cachedPermissions) {
          await dispatch(setUserPermissions(cachedPermissions));
        }

        const isGuest: boolean = await setUser();

        if (cachedPermissions && !isGuest) {
          if (isSplitView() || !issueId) {
            isRedirected = true;
            Router.Issues({
              issueId,
              navigateToActivity,
            });
          } else if (issueId) {
            isRedirected = true;
            Router.Issue({
              issueId,
              navigateToActivity,
              forceReset: true,
            });
          }
        }
      }
    } catch (e) {}

    if (!isRedirected) {
      redirectToHome(config.backendUrl);
    }

    return isRedirected;

    async function setUser(): Promise<boolean> {
      const hubCurrentUser: UserCurrent | null | undefined = storage.getStorageState()
        .currentUser;
      const ytCurrentUser: User | null | undefined =
        hubCurrentUser?.ytCurrentUser;

      if (ytCurrentUser) {
        await dispatch(setYTCurrentUser(ytCurrentUser));
      }

      return ytCurrentUser?.guest === true;
    }
  };
}

function redirectToHome(backendUrl: string = '') {
  Router.Home({
    backendUrl: backendUrl,
    error: null,
    message: i18n('Connecting to YouTrack...'),
  });
}

async function refreshConfig(backendUrl: string): Promise<AppConfig> {
  const updatedConfig: AppConfig = await doConnect(backendUrl);
  await storeConfig(updatedConfig);
  await storage.flushStoragePart({
    currentAppVersion: packageJson.version,
  });
  return updatedConfig;
}

export function initializeApp(
  config: AppConfig,
  issueId: string | null,
  navigateToActivity: boolean,
): Action {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: () => Api,
  ): Promise<void> => {
    const cachedCurrentUser: UserCurrent | null | undefined = storage.getStorageState()
      ?.currentUser?.ytCurrentUser;
    const userProfileLocale: UserGeneralProfileLocale | null | undefined =
      cachedCurrentUser?.profiles?.general?.locale;

    if (userProfileLocale?.language) {
      loadTranslation(userProfileLocale.locale, userProfileLocale.language);
    }

    const isRedirectedToTargetRoute: boolean = await dispatch(
      redirectToRoute(config, issueId, navigateToActivity),
    );
    let configCurrent = config;
    const currentAppVersion: string | null | undefined = storage.getStorageState()
      .currentAppVersion;
    const versionHasChanged: boolean =
      currentAppVersion != null && packageJson.version !== currentAppVersion;

    try {
      if (versionHasChanged) {
        log.info(
          `App upgraded from ${currentAppVersion || 'NOTHING'} to "${
            packageJson.version
          }"; reloading config`,
        );
        configCurrent = await refreshConfig(config.backendUrl);
      }

      await dispatch(initializeAuth(configCurrent));
    } catch (error) {
      log.log('App failed to initialize auth. Reloading config...', error);

      try {
        configCurrent = await refreshConfig(config.backendUrl);
      } catch (err) {
        Router.Home({
          backendUrl: config.backendUrl,
          err,
        });
        return;
      }

      try {
        await dispatch(initializeAuth(configCurrent));
      } catch (e) {
        Router.LogIn({
          config,
          errorMessage: getErrorMessage(e as CustomError),
        });
        return;
      }
    }

    await dispatch(checkUserAgreement());

    if (!getState().app.showUserAgreement) {
      await dispatch(
        completeInitialization(
          issueId,
          navigateToActivity,
          isRedirectedToTargetRoute,
        ),
      );
    }

    dispatch(subscribeToURL());

    if (!versionHasChanged) {
      refreshConfig(configCurrent.backendUrl);
    }
  };
}
export async function doConnect(newURL: string): Promise<any> {
  return await loadConfig(newURL);
}
export function connectToNewYoutrack(newURL: string): Action {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: () => Api,
  ) => {
    const config = await doConnect(newURL);
    await storeConfig(config);
    const auth: OAuth2 = await createAuthInstance(config);
    dispatch(setAuthInstance(auth));
    Router.LogIn({
      config,
    });
  };
}
export function setAccount(
  notificationRouteData: NotificationRouteData | Record<string, any> = {},
): Action {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: () => Api,
  ) => {
    const state: StorageState = await storage.populateStorage();
    await dispatch(populateAccounts());
    const notificationBackendUrl: string | null | undefined =
      notificationRouteData?.backendUrl;

    if (
      notificationBackendUrl &&
      state?.config &&
      notificationBackendUrl !== state.config?.backendUrl
    ) {
      const notificationIssueAccount:
        | StorageState
        | null
        | undefined = await appActionsHelper.targetAccountToSwitchTo(
        notificationBackendUrl,
      );

      if (notificationIssueAccount) {
        await dispatch(updateOtherAccounts(notificationIssueAccount));
        storage.flushStoragePart({
          config: notificationIssueAccount.config,
        });
      }
    }

    const targetConfig: AppConfig | null | undefined = storage.getStorageState().config;

    if (targetConfig) {
      dispatch(
        initializeApp(
          targetConfig,
          notificationRouteData?.issueId || null,
          notificationRouteData.navigateToActivity,
        ),
      );
    } else {
      log.info('App is not configured, entering server URL');

      const navigateTo = (serverUrl: string | null) =>
        Router.EnterServer({
          serverUrl,
        });

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
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: () => Api,
  ): Promise<void> => {
    if (await DeviceInfo.isEmulator()) {
      return;
    }

    PushNotificationsProcessor.init();

    const onSwitchAccount = async (account: StorageState, issueId: string) =>
      await dispatch(switchAccount(account, false, issueId));

    if (isRegisteredForPush()) {
      log.info(
        'Device was already registered for push notifications. Initializing.',
      );
      PushNotifications.initialize(onSwitchAccount);
      return;
    }

    try {
      await PushNotifications.register();
      PushNotifications.initialize(onSwitchAccount);
      setRegisteredForPush(true);
      log.info('Successfully registered for push notifications');
    } catch (err) {
      notifyError(err as CustomError);
    }
  };
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
  return inboxThreadsCache?.[folderIdAllKey]?.[0];
};

const inboxCheckUpdateStatus = (): Action => {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: () => Api,
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

export function setDraftCommentData(setDraft: Function, getCommentDraft: () => () => Promise<IssueComment | null>, entity: AnyIssue | Article) {
  return {
    entity,
    getCommentDraft,
    setDraft,
    type: SET_DRAFT_COMMENT_DATA,
  };
}

const addMentionToDraftComment = (userLogin: string): Action => {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: () => Api,
  ) => {
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

const getDraftCommentData = () => {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: () => Api,
  ): Promise<DraftCommentData | null> => {
    try {
      return await getState().app.draftCommentData;
    } catch (e) {
      return null;
    }
  };
};


export {
  addMentionToDraftComment,
  getDraftCommentData,
  inboxCheckUpdateStatus,
  setGlobalInProgress,
};
