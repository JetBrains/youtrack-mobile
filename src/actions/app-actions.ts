import {Linking, PermissionsAndroid, Platform} from 'react-native';

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
import pushNotificationsHelper from 'components/push-notifications/push-notifications-helper';
import PushNotificationsProcessor from 'components/push-notifications/push-notifications-processor';
import Router from 'components/router/router';
import usage from 'components/usage/usage';
import {
  folderIdAllKey,
  folderIdMap,
} from 'views/inbox-threads/inbox-threads-helper';
import {checkVersion, FEATURE_VERSION} from 'components/feature/feature';
import {
  extractArticleId, extractHelpdeskFormId,
  extractIssueId,
  extractIssuesQuery,
  openByUrlDetector,
} from 'components/open-url-handler/open-url-handler';
import {getCachedPermissions, storeYTCurrentUser, targetAccountToSwitchTo} from './app-actions-helper';
import {getErrorMessage} from 'components/error/error-resolver';
import {getStoredSecurelyAuthParams} from 'components/storage/storage__oauth';
import {getStorageState} from 'components/storage/storage';
import {hasType} from 'components/api/api__resource-types';
import {i18n} from 'components/i18n/i18n';
import {isAndroidPlatform, isIOSPlatform, until} from 'util/util';
import {isSplitView} from 'components/responsive/responsive-helper';
import {loadConfig} from 'components/config/config';
import {loadTranslation} from 'components/i18n/i18n-translation';
import {logEvent} from 'components/log/log-helper';
import {navigateToRouteById} from 'components/router/router-helper';
import {notify, notifyError} from 'components/notification/notification';
import {routeMap} from 'app-routes';
import {SET_DRAFT_COMMENT_DATA, SET_PROGRESS} from './action-types';
import {setApi} from 'components/api/api__instance';

import type {Activity} from 'types/Activity';
import type {AnyIssue} from 'types/Issue';
import type {AppConfig, EndUserAgreement} from 'types/AppConfig';
import type {AppState} from 'reducers';
import type {Article} from 'types/Article';
import type {AuthParams} from 'types/Auth';
import type {AnyError} from 'types/Error';
import type {
  User,
  UserAppearanceProfile,
  UserArticlesProfile,
  UserHelpdeskProfile,
} from 'types/User';
import type {DraftCommentData, IssueComment} from 'types/CustomFields';
import type {InboxFolder, InboxThread} from 'types/Inbox';
import type {NetInfoState} from '@react-native-community/netinfo';
import type {NotificationRouteData} from 'types/Notification';
import type {PermissionCacheItem} from 'types/Permission';
import type {ReduxAction, ReduxStateGetter, ReduxAPIGetter, ReduxThunkDispatch} from 'types/Redux';
import type {StorageState} from 'components/storage/storage';
import type {UserGeneralProfileLocale} from 'types/User';
import type {UserProject} from 'types/Project';
import type {WorkTimeSettings} from 'types/Work';


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
    await storage.clearStorage();

    setApi(null);
    dispatch({
      type: types.LOG_OUT,
    });
    log.info('App Actions: User is logged out');
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

export function setEnabledFeatures(features: string[]) {
  return {
    type: types.SET_FEATURES,
    features,
  };
}

export function onNavigateBack(closingView: Record<string, any>) {
  return {
    type: types.ON_NAVIGATE_BACK,
    closingView,
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
        log.info('App Actions: Cannot update user appearance profile.');
      }
    }
  };
}

export function receiveUserHelpdeskProfile(helpdeskProfiles?: UserHelpdeskProfile): ReduxAction {
  return async (
    dispatch: ReduxThunkDispatch,
    getState: ReduxStateGetter,
    getApi: ReduxAPIGetter,
  ) => {
    if (helpdeskProfiles) {
      try {
        const helpdesk = await getApi().user.updateUserHelpdeskProfiles('me', helpdeskProfiles);
        dispatch({
          type: types.RECEIVE_USER_HELPDESK_PROFILES,
          helpdesk,
        });
      } catch (error) {
        log.info('App Actions: Cannot update user helpdesk profile.');
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

export const cacheUserLastVisitedArticle = (article: Article | null, activities?: Activity[]) => {
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

export function loadCurrentHubUserAndSetAPI(): ReduxAction {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter) => {
    if (!getState().app?.networkState?.isConnected) {
      return;
    }
    const auth = getState().app.auth;
    if (auth) {
      const authParams = auth.getAuthParams();
      await auth.loadCurrentHubUser(authParams);
      const currentUser = storage.getStorageState().currentUser;
      if (!auth.currentUser) {
        log.warn('AppActions(loadCurrentUserAndSetAPI): Auth Current user is not set');
      }
      if (!auth.currentUser?.endUserAgreementConsent?.accepted) {
        log.warn('AppActions(loadCurrentUserAndSetAPI): Auth Current user consent is not accepted');
      }
      await storage.flushStoragePart({
        currentUser: {...currentUser, ...auth.currentUser},
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

function createAuthInstance(config: AppConfig): OAuth2 {
  return new OAuth2(config, (errorMsg?: string) => {
    Router.EnterServer({
      serverUrl: config.backendUrl,
      error: errorMsg || i18n(
        `Your authorization token has expired or is invalid. Re-enter your login credentials to refresh the token. If you are still unable to log in, please contact your administrator.`
      ),
    });
  });
}

async function initAuthInstance(config: AppConfig): Promise<OAuth2> {
  const auth: OAuth2 = createAuthInstance(config);

  try {
    await auth.setAuthParamsFromCache();
  } catch (e) {}

  usage.init(config.statisticsEnabled);
  return auth;
}

function showUserAgreement(agreement: Agreement) {
  usage.trackEvent('app_actions', 'EUA is shown');
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
): Promise<AuthParams> {
  return new Promise(resolve => {
    Router.LogIn({
      config,
      onChangeServerUrl: onBack,
      onLogIn: (authParams: AuthParams) => resolve(authParams),
    });
  });
}

function applyAccount(config: AppConfig, auth: OAuth2, authParams: AuthParams): ReduxAction {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter) => {
    const otherAccounts: StorageState[] = getState().app.otherAccounts || [];
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
    await dispatch(loadCurrentHubUserAndSetAPI());
    await dispatch(checkUserAgreement());

    if (!getState().app.showUserAgreement) {
      await dispatch(completeInitialization());
    }
  };
}

export function addAccount(serverUrl: string = ''): ReduxAction {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter) => {
    log.info('App Actions: Adding new account started');

    try {
      const config: AppConfig = await connectToOneMoreServer(serverUrl, () => {
        log.info('App Actions: Adding new server canceled by user');
        Router.navigateToDefaultRoute();
      });
      log.info(`App Actions: Config loaded for the new server, logging in...`);
      const tmpAuthInstance: OAuth2 = createAuthInstance(config); //NB! this temporary instance for Login screen code

      const authParams: AuthParams = await authorizeOnOneMoreServer(
        config,
        function onBack(url: string) {
          log.info('Authorization canceled by user, going back');
          dispatch(addAccount(url));
        },
      );
      log.info('App Actions: Authorized on new server, applying');
      await dispatch(
        applyAccount(config, tmpAuthInstance, authParams),
      );
      log.info(`App Actions: Successfully added account`);
    } catch (err) {
      notifyError(err as AnyError);
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
  articleId?: string,
): ReduxAction {
  return async (dispatch: ReduxThunkDispatch) => {
    dispatch(resetUserArticlesProfile());
    cacheUserLastVisitedArticle(null);

    try {
      await dispatch(changeAccount(account, dropCurrentAccount, issueId, articleId));
    } catch (e) {}
  };
}

export function updateOtherAccounts(
  account: StorageState,
  removeCurrentAccount: boolean = false
): ReduxAction<Promise<StorageState[]>> {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter) => {
    const state: AppState = getState();
    const currentAccount: StorageState = storage.getStorageState();
    log.info('App Actions: Changing account');
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
  issueId?: string,
  articleId?: string,
  navigateToActivity?: string,
  searchQuery?: string,
  helpdeskFormId?: string,
): ReduxAction {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter) => {
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

    redirectToHome(account.config!.backendUrl);
    const auth: OAuth2 = createAuthInstance(config);
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
        account.creationTimestamp!.toString(),
      );
      await storeConfig(config);
      await dispatch(initializeAuth(config));
      await dispatch(loadCurrentHubUserAndSetAPI());
      await dispatch(checkUserAgreement());

      if (!state.app.showUserAgreement) {
        dispatch(completeInitialization(issueId, articleId, navigateToActivity, searchQuery, false, helpdeskFormId));
      }

      log.info('App Actions: Account changed');
    } catch (err) {
      notifyError(err as AnyError);
      throw err;
    }

    dispatch(endAccountChange());
  };
}

export function signOutFromAccount(): ReduxAction {
  return async (
    dispatch: ReduxThunkDispatch,
    getState: ReduxStateGetter,
    getApi: ReduxAPIGetter,
  ) => {
    const otherAccounts: StorageState[] = getState().app.otherAccounts || [];
    setRegisteredForPush(false);
    try {
      await PushNotifications.unregister(getState().app.user?.login!);
    } catch (err) {
      log.warn('Failed to unsubscribe from push notifications', err);
    }
    await getApi().user.logout();
    dispatch(logOut());

    log.info('App Actions: Logging out from the curren account');
    if (otherAccounts.length > 0) {
      log.info('App Actions: Switching an account');
      redirectToHome(otherAccounts[0].config?.backendUrl);
      await dispatch(switchAccount(otherAccounts[0], true));
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
    const auth: OAuth2 = (getState().app.auth as any) as OAuth2;

    try {
      const permissions: PermissionCacheItem[] = await appActionsHelper.loadPermissions(
        auth.getTokenType(),
        auth.getAccessToken(),
        auth.getPermissionsCacheURL(),
      );
      await dispatch(setUserPermissions(permissions));
      log.info('App Actions: PermissionsStore created');
      appActionsHelper.updateCachedPermissions(permissions);
      log.info('App Actions: Permissions stored');
    } catch (error) {
      log.warn(error);
    }
  };
}

export function completeInitialization(
  issueId?: string,
  articleId?: string,
  navigateToActivity?: string,
  searchQuery?: string,
  isRedirected: boolean = false,
  helpdeskFormId?: string,
): ReduxAction {
  return async (dispatch: ReduxThunkDispatch) => {
    await dispatch(applyGlobalSettings());
    dispatch({
      type: types.SET_HELPDESK_MENU_HIDDEN,
      hidden: storage.getStorageState().helpdeskMenuHidden,
    });
    log.info('App Actions: Completing initialization');
    const cachedCurrentUser: User | undefined = storage.getStorageState()?.currentUser?.ytCurrentUser;
    const cachedLocale: UserGeneralProfileLocale | undefined = cachedCurrentUser?.profiles?.general?.locale;
    const currentUser: User = await dispatch(loadYTCurrentUser());
    const userProfileLocale: UserGeneralProfileLocale | undefined = currentUser?.profiles?.general?.locale;
    const isLanguageChanged: boolean = !cachedLocale?.language || (
      !!cachedLocale?.language &&
      !!userProfileLocale?.language &&
      cachedLocale?.language !== userProfileLocale?.language
    );

    if (isLanguageChanged && userProfileLocale?.language) {
      loadTranslation(userProfileLocale?.locale, userProfileLocale?.language);

      if (!issueId && !articleId) {
        redirectToHome(storage.getStorageState()?.config?.backendUrl);
      }
    }

    await dispatch(loadUserPermissions());
    await dispatch(cacheProjects());
    log.info('App Actions: Initialization completed');

    if (!isRedirected) {
      if (currentUser.profiles?.helpdesk?.isReporter) {
        Router.Tickets();
      } else if (Router.getRoutes().length <= 1) {
        Router.navigateToDefaultRoute(
          issueId || articleId || searchQuery || helpdeskFormId ? {
            issueId,
            articleId,
            navigateToActivity,
            searchQuery,
            helpdeskFormId,
          } : undefined,
        );
      }
    }

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

export function loadYTCurrentUser(): ReduxAction<Promise<User>> {
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
      notifyError(error as AnyError);
    }
  };
}

export function acceptUserAgreement(): ReduxAction {
  return async (
    dispatch: ReduxThunkDispatch,
    getState: ReduxStateGetter,
    getApi: ReduxAPIGetter,
  ) => {
    log.info('App Actions: User agreement accepted');
    usage.trackEvent('app_actions', 'EUA is accepted');
    const api: Api = getApi();
    try {
      await api.acceptUserAgreement();
      if (
        !(Router._currentRoute?.routeName === routeMap.Issues || Router._currentRoute?.routeName === routeMap.Issue)
      ) {
        dispatch(completeInitialization());
      }
    } catch (e) {
      dispatch(signOutFromAccount());
    } finally {
      dispatch({type: types.HIDE_USER_AGREEMENT});
    }
  };
}

export function declineUserAgreement(): ReduxAction {
  return async (dispatch: ReduxThunkDispatch) => {
    log.info('App Actions: User agreement declined');
    usage.trackEvent('app_actions', 'EUA is declined');
    dispatch({
      type: types.HIDE_USER_AGREEMENT,
    });
    dispatch(signOutFromAccount());
  };
}

export function initializeAuth(config: AppConfig): ReduxAction {
  return async (dispatch: ReduxThunkDispatch) => {
    const auth: OAuth2 = await initAuthInstance(config);
    dispatch(setAuthInstance(auth));
  };
}

type Agreement = | EndUserAgreement | null | undefined;

function checkUserAgreement(): ReduxAction {
  return async (
    dispatch: ReduxThunkDispatch,
    getState: ReduxStateGetter,
    getApi: ReduxAPIGetter,
  ): Promise<void> => {
    const api: Api = getApi();
    const euc = getState().app.auth!.currentUser?.endUserAgreementConsent;
    log.info('App Actions: Checking user agreement');

    if (euc?.accepted) {
      log.info('App Actions: The EUA already accepted, skip check');
      return;
    } else {
      log.info('App Actions(checkUserAgreement): The EUA is not accepted');
    }

    const agreement = await api.getUserAgreement();

    if (!agreement) {
      log.info('App Actions: EUA is not supported, skip check');
      return;
    }

    if (!agreement.enabled) {
      log.info('App Actions: EUA is disabled, skip check');
      return;
    }
    log.warn('App Actions(checkUserAgreement): User agreement should be accepted');
    dispatch(showUserAgreement(agreement));
  };
}

export function onLogIn(authParams: AuthParams): ReduxAction {
  return async (
    dispatch: (...args: any[]) => any,
    getState: ReduxStateGetter,
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

    await dispatch(loadCurrentHubUserAndSetAPI());
    await dispatch(checkUserAgreement());

    if (!getState().app.showUserAgreement) {
      dispatch(completeInitialization());
    }
  };
}

export function cacheProjects(): ReduxAction<Promise<UserProject[]>> {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
    const [error, userFolders] = await until<UserProject[]>(
      getApi().user.getUserFolders('', [
        '$type,id,ringId,shortName,name,pinned,restricted,plugins(helpDeskSettings(enabled))',
      ])
    );
    const projects: UserProject[] =
      error || !Array.isArray(userFolders) ? [] : userFolders.filter(it => hasType.project(it));
    dispatch({type: types.SET_PROJECTS, projects});
    await storage.flushStoragePart({projects});
    return projects;
  };
}

async function navigateToScreen(
  backendUrl: string,
  dispatch: ReduxThunkDispatch,
  url: string,
  forceReset: boolean,
  issueId?: string,
  articleId?: string,
  searchQuery?: string,
  helpdeskFormId?: string,
) {
  if (url.indexOf(backendUrl) === -1) {
    const targetServerURL = UrlParse(url).origin;
    const account = await targetAccountToSwitchTo(targetServerURL, backendUrl);
    if (account) {
      await dispatch(changeAccount(account, false, issueId, articleId, undefined, searchQuery, helpdeskFormId));
    } else {
      notify(i18n('You are trying to open a link from another server. Please add this server to the app first.'));
    }
  } else {
    const navigateToActivity: string | undefined = url.split('#focus=Comments-')?.[1];
    if (helpdeskFormId) {
      Router.HelpDeskFeedback({uuid: helpdeskFormId});
    } else {
      const splitView = isSplitView();
      if (issueId) {
            if (splitView) {
              Router.Issues({issueId, issuePlaceholder: {id: issueId}, navigateToActivity});
            } else {
              Router.Issue({issueId, issuePlaceholder: {id: issueId}, navigateToActivity}, {forceReset});
            }
          } else if (articleId) {
            if (splitView) {
              Router.KnowledgeBase({lastVisitedArticle: {id: articleId}, navigateToActivity, preventReload: true}, {forceReset});
            } else {
              Router.Article({articlePlaceholder: {id: articleId}, navigateToActivity}, {forceReset});
            }
          } else {
            Router.navigateToDefaultRoute({searchQuery});
          }
    }
  }
}

export function subscribeToURL(): ReduxAction {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
    openByUrlDetector(
      async (url: string, issueId?: string, articleId?: string, helpdeskFormId?: string) => {
        if (isAuthorized()) {
          usage.trackEvent('app_actions', 'Open issue in app by URL');
          navigateToScreen(
            getApi().config.backendUrl,
            dispatch,
            url,
            true,
            issueId,
            articleId,
            undefined,
            helpdeskFormId
          );
        }
      },
      async (url: string, searchQuery: string) => {
        if (isAuthorized()) {
          usage.trackEvent('app_actions', 'Open issues query in app by URL');
          navigateToScreen(getApi().config.backendUrl, dispatch, url, true, undefined, undefined, searchQuery);
        }
      }
    );

    function isAuthorized(): boolean {
      const isUserAuthorized = !!getState().app?.auth?.currentUser;
      if (!isUserAuthorized) {
        log.info(`App Actions: User is not authorized, URL won't be opened`);
      }
      return isUserAuthorized;
    }
  };
}

export function handleURL(uri: string = ''): ReduxAction {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
    const backendUrl = getApi().config.backendUrl;
    const url = uri.trim();
    if (url) {
      const issueId = extractIssueId(url) ?? undefined;
      const articleId = extractArticleId(url) ?? undefined;
      const helpdeskFormId = extractHelpdeskFormId(url) ?? undefined;
      const query = extractIssuesQuery(url) ?? undefined;
      if (issueId || articleId || helpdeskFormId) {
        navigateToScreen(backendUrl, dispatch, url, true, issueId, articleId, undefined, helpdeskFormId);
      } else if (query) {
        navigateToScreen(backendUrl, dispatch, url, true, undefined, undefined, query);
      } else {
        Linking.openURL(url);
      }
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

export function migrateToIssuesFilterSearch(): ReduxAction {
  return async (dispatch: ReduxThunkDispatch) => {
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

export function applyGlobalSettings(): ReduxAction {
  return async (
    dispatch: ReduxThunkDispatch,
    getState: ReduxStateGetter,
    getApi: ReduxAPIGetter,
  ) => {
    const [error, globalSettings] = await until(getApi().globalSettings.getSettings());
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
  issueId?: string,
  articleId?: string,
  navigateToActivity?: string,
): ReduxAction {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter) => {
    const currentUser = storage.getStorageState()?.currentUser;
    const cachedCurrentUser: User | undefined = currentUser?.ytCurrentUser;
    if (cachedCurrentUser) {
      await dispatch(setYTCurrentUser(cachedCurrentUser));
    }
    const cachedPermissions: PermissionCacheItem[] | null = getCachedPermissions();
    if (cachedPermissions) {
      await dispatch(setUserPermissions(cachedPermissions));
    }

    const profiles = cachedCurrentUser?.profiles;
    const userProfileLocale: UserGeneralProfileLocale | undefined = profiles?.general?.locale;
    if (userProfileLocale?.language) {
      loadTranslation(userProfileLocale.locale, userProfileLocale.language);
    }

    await dispatch(migrateToIssuesFilterSearch());
    await createAPIInstance();

    let isRedirected: boolean = false;
    if (cachedPermissions) {
      isRedirected = navigateToRouteById(issueId, articleId, navigateToActivity, !!profiles?.helpdesk?.isReporter);
    }

    let configCurrent = config;
    const currentAppVersion: string | null = storage.getStorageState().currentAppVersion;
    const newVersion = packageJson.version;
    const versionHasChanged: boolean = currentAppVersion != null && newVersion !== currentAppVersion;
    storage.flushStoragePart({currentAppVersion: newVersion});

    try {
      if (versionHasChanged) {
        await _refactoringAndroidResubscribeToPN(); //should be first in a row

        log.info(`App Actions: App upgraded to "${newVersion}"; reloading config`);
        configCurrent = await refreshConfig(config.backendUrl);
      }

      await dispatch(initializeAuth(configCurrent));
      await dispatch(loadCurrentHubUserAndSetAPI());
    } catch (error) {
      log.log('App Actions: App failed to initialize auth. Reloading config...', error);

      try {
        configCurrent = await refreshConfig(config.backendUrl);
      } catch (err) {
        return Router.Home({backendUrl: config.backendUrl, err});
      }

      try {
        await dispatch(initializeAuth(configCurrent));
        await dispatch(loadCurrentHubUserAndSetAPI());
      } catch (e) {
        return Router.LogIn({config, errorMessage: getErrorMessage(e as AnyError)});
      }
    }

    await dispatch(checkUserAgreement());

    if (!getState().app.showUserAgreement) {
      const url = await Linking.getInitialURL();
      await dispatch(
        completeInitialization(
          issueId,
          articleId,
          navigateToActivity,
          extractIssuesQuery(url) ?? undefined,
          isRedirected,
        ),
      );
    }

    dispatch(subscribeToURL());

    if (!versionHasChanged) {
      refreshConfig(configCurrent.backendUrl);
    }

    async function createAPIInstance() {
      if (config) {
        try {
          const auth: OAuth2 = await initAuthInstance(config);
          dispatch(setAuthInstance(auth));
          setApi(new Api(auth));
        } catch (e) {
          redirectToHome(config.backendUrl);
        }
      }
    }

    async function _refactoringAndroidResubscribeToPN() {
      if (
        isAndroidPlatform() &&
        !!getStorageState().deviceToken &&
        currentAppVersion &&
        newVersion.startsWith('2024.3.1')
      ) {
        log.info('REFACTORING:ANDROID:(YTM-21855): re-subscribe to push notifications');
        await pushNotificationsHelper.storeDeviceToken('_');
      }

    }
  };
}

export async function doConnect(newURL: string): Promise<any> {
  return await loadConfig(newURL);
}

export function connectToNewYoutrack(newURL: string): ReduxAction<Promise<AppConfig>> {
  return async (dispatch: ReduxThunkDispatch) => {
    const config = await doConnect(newURL);
    await storeConfig(config);
    const auth: OAuth2 = await initAuthInstance(config);
    dispatch(setAuthInstance(auth));
    Router.LogIn({config});
    return config;
  };
}

export function setAccount(notificationRouteData: NotificationRouteData | null): ReduxAction {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter) => {
    const state: StorageState = await storage.populateStorage();
    await dispatch(populateAccounts());
    const backendUrl: string | undefined = notificationRouteData?.backendUrl;

    if (
      backendUrl &&
      state?.config &&
      backendUrl !== state.config?.backendUrl
    ) {
      const notificationIssueAccount = await appActionsHelper.targetAccountToSwitchTo(
        backendUrl,
        state.config?.backendUrl,
      );

      if (notificationIssueAccount) {
        await dispatch(updateOtherAccounts(notificationIssueAccount));
        storage.flushStoragePart({
          config: notificationIssueAccount.config,
        });
      }
    }

    const targetConfig: AppConfig | null = storage.getStorageState().config;

    if (targetConfig) {
      dispatch(
        initializeApp(
          targetConfig,
          notificationRouteData?.issueId,
          notificationRouteData?.articleId,
          notificationRouteData?.navigateToActivity,
        ),
      );
    } else {
      log.info('App Actions: App is not configured, entering server URL');

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

export function subscribeToPushNotifications(): ReduxAction {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter) => {
    if (await DeviceInfo.isEmulator()) {
      return;
    }

    PushNotificationsProcessor.init();

    const onSwitchAccount = async (account: StorageState, issueId?: string, articleId?: string) => {
      await dispatch(switchAccount(account, false, issueId, articleId));
    };

    const userLogin = getState().app.user?.login as string;
    if (isRegisteredForPush()) {
      log.info('App Actions: Device was already registered for push notifications. Initializing.');
      try {
        PushNotifications.initialize(onSwitchAccount, getState().app.user?.login!);
      } catch (e) {
        setRegisteredForPush(false);
      }
      return;
    }

    if (isAndroidPlatform()) {
      const ver = typeof Platform.Version === 'string' ? parseInt(Platform.Version, 10) : Platform.Version;
      if (ver >= 33) {
        try {
          const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            await doSubscribe(onSwitchAccount, userLogin);
            log.info('App Actions: Push notifications permission granted');
          } else {
            log.warn('App Actions: Push notifications permission is not allowed');
          }
        } catch (err) {
          log.warn(err);
        }
      }
    } else {
      await doSubscribe(onSwitchAccount, userLogin);
    }
  };
}

async function doSubscribe(
  onSwitchAccount: (account: StorageState, issueId?: string, articleId?: string) => void,
  userLogin: string
) {
  try {
    await PushNotifications.register(userLogin);
    PushNotifications.initialize(onSwitchAccount, userLogin);
    setRegisteredForPush(true);
  } catch (err) {
    setRegisteredForPush(null);
    notifyError(err as AnyError);
  }
}

function isRegisteredForPush(): boolean {
  const storageState: StorageState = storage.getStorageState();
  return isIOSPlatform()
    ? storageState.isRegisteredForPush
    : !!storageState.deviceToken;
}

function setRegisteredForPush(isRegistered: boolean | null) {
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
      const [error, folders] = await until<InboxFolder[]>(
        getApi().inbox.getFolders(
          typeof firstCachedThread?.notified === 'number'
            ? firstCachedThread?.notified + 1
            : undefined,
        ),
      );

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

const setHelpdeskMenuVisibility = (hidden: boolean): ReduxAction => {
  return async (dispatch: ReduxThunkDispatch) => {
    storage.flushStoragePart({helpdeskMenuHidden: hidden});
    dispatch({
      type: types.SET_HELPDESK_MENU_HIDDEN,
      hidden,
    });
  };
};

export {
  addMentionToDraftComment,
  inboxCheckUpdateStatus,
  setGlobalInProgress,
  setHelpdeskMenuVisibility,
  navigateToScreen,
};
