import {Linking} from 'react-native';

import configureMockStore, {MockStore} from 'redux-mock-store';
import fetchMock from 'fetch-mock';
import thunk from 'redux-thunk';
import {cleanup} from '@testing-library/react-native';

import * as actions from './app-actions';
import * as appActionHelper from './app-actions-helper';
import * as feature from 'components/feature/feature';
import * as Notification from 'components/notification/notification';
import * as permissionsHelper from 'components/permissions-store/permissions-helper';
import * as routerHelper from 'components/router/router-helper';
import * as storage from 'components/storage/storage';
import * as storageOauth from 'components/storage/storage__oauth';
import * as types from './action-types';
import * as urlUtils from '../components/open-url-handler/open-url-handler';
import API from 'components/api/api';
import log from 'components/log/log';
import mocks from 'test/mocks';
import OAuth2 from 'components/auth/oauth2';
import PermissionsStore from 'components/permissions-store/permissions-store';
import PushNotifications from 'components/push-notifications/push-notifications';
import Router from 'components/router/router';
import {folderIdAllKey} from 'views/inbox-threads/inbox-threads-helper';

import type {AppConfig} from 'types/AppConfig';
import type {AppState} from 'reducers';
import type {AuthParams} from 'types/Auth';
import type {InboxFolder} from 'types/Inbox';
import type {PermissionCacheItem} from 'types/Permission';
import type {ReduxThunkDispatch} from 'types/Redux';
import type {RootState} from 'reducers/app-reducer';
import type {StorageState} from 'components/storage/storage';
import type {User, UserCurrent, UserHub} from 'types/User';

jest.mock('components/storage/storage', () => {
  const st = jest.requireActual('components/storage/storage');
  return {
    ...st,
    clearStorage: jest.fn(),
  };
});

jest.mock('components/router/router', () => ({
  navigateToDefaultRoute: jest.fn(),
  Home: jest.fn(),
  EnterServer: jest.fn(),
  Issues: jest.fn(),
}));

jest.mock('react-native/Libraries/Linking/Linking', () => ({
  getInitialURL: jest.fn().mockResolvedValue(''),
  addEventListener: jest.fn(),
}));

jest.mock('components/usage/usage');
jest.mock('components/open-url-handler/open-url-handler');


const backendURLMock = 'https://example.com';
let appConfigMock: AppConfig;
let apiMock: API;
let appStateMock: RootState;
let store: MockStore;
let userMock: User;
let authParamsMock: AuthParams;
let dispatch: ReduxThunkDispatch;

const getApi = () => apiMock;

const middlewares = [thunk.withExtraArgument(getApi)];
const storeMock = configureMockStore(middlewares);

describe('app-actions', () => {
  userMock = mocks.createUserMock() as unknown as User;
  beforeEach(async () => {
    jest
      .spyOn(storageOauth, 'getStoredSecurelyAuthParams')
      .mockResolvedValue(authParamsMock);

    apiMock = createAPIMock();
    appStateMock = {
      auth: createAuthInstanceMock({} as User),
      user: userMock,
    } as RootState;
    updateStore({app: appStateMock} as AppState);
    await storage.populateStorage();

    Router.getRoutes = jest.fn().mockReturnValue([{}]);
  });

  afterEach(() => {
    (storageOauth.getStoredSecurelyAuthParams as jest.Mock).mockClear();
    jest.clearAllMocks();
    cleanup();
  });


  describe('subscribeToPushNotifications', () => {
    beforeEach(() => {
      jest.spyOn(PushNotifications, 'register').mockResolvedValue();
      jest.spyOn(PushNotifications, 'initialize');
      jest.spyOn(Notification, 'notifyError');
      jest.spyOn(Notification, 'notify');
      Notification.setNotificationComponent({show: jest.fn()} as any);
      setRegistered(false);
    });
    afterEach(() => {
      (PushNotifications.register as jest.Mock).mockRestore();
      (PushNotifications.initialize as jest.Mock).mockRestore();
      (Notification.notifyError as jest.Mock).mockRestore();
      (Notification.notify as jest.Mock).mockRestore();
    });


    describe('Registration success', () => {
      it('should subscribe if a device is not registered', async () => {
        await dispatch(actions.subscribeToPushNotifications());
        expect(PushNotifications.register).toHaveBeenCalledWith(userMock.login);
        expect(PushNotifications.initialize).toHaveBeenCalledWith(expect.any(Function), userMock.login);
      });

      it('should not subscribe, but initialize if a device is already registered', async () => {
        setRegistered(true);
        await dispatch(actions.subscribeToPushNotifications());
        expect(PushNotifications.register).not.toHaveBeenCalled();
        expect(PushNotifications.initialize).toHaveBeenCalledWith(expect.any(Function), userMock.login);
      });
    });


    describe('Registration error', () => {
      const registrationErrorMock = new Error('Registration failed');
      beforeEach(() => {
        jest.spyOn(log, 'warn');
      });

      it('should not initialize if registration failed', async () => {
        setRegistrationThrow();
        await dispatch(actions.subscribeToPushNotifications());
        expect(PushNotifications.register).toHaveBeenCalledWith(userMock.login);
        expect(PushNotifications.initialize).not.toHaveBeenCalled();
      });

      it('should show error screen if registration failed', async () => {
        setRegistrationThrow();
        await dispatch(actions.subscribeToPushNotifications());
        expect(Notification.notifyError).toHaveBeenCalledWith(
          registrationErrorMock,
        );
      });

      it('should not initialize if a registration service returns error', async () => {
        setRegistrationServiceReturnError();
        await dispatch(actions.subscribeToPushNotifications());
        expect(PushNotifications.register).toHaveBeenCalledWith(userMock.login);
        expect(PushNotifications.initialize).not.toHaveBeenCalled();
      });

      it('should log error and should not show error screen if a registration service returns error', async () => {
        setRegistrationServiceReturnError();
        await dispatch(actions.subscribeToPushNotifications());
        expect(Notification.notifyError).toHaveBeenCalledWith(
          registrationErrorMock,
        );
      });

      function setRegistrationThrow() {
        jest
          .spyOn(PushNotifications, 'register')
          .mockReturnValue(Promise.reject(registrationErrorMock));
      }

      function setRegistrationServiceReturnError() {
        jest
          .spyOn(PushNotifications, 'register')
          .mockReturnValue(Promise.reject(registrationErrorMock));
      }
    });
  });


  describe('signOutFromAccount', () => {
    afterEach(() => {
      (PushNotifications.unregister as jest.Mock).mockReset();
      (appStateMock.auth?.logOut as jest.Mock)?.mockReset?.();
    });
    beforeEach(() => {
      jest.spyOn(PushNotifications, 'unregister').mockResolvedValueOnce(null);
      updateStore({
        app: {...appStateMock, otherAccounts: []},
      } as unknown as AppState);
    });

    it('should logout from the only account', async () => {
      const auth = appStateMock.auth as OAuth2;
      jest.spyOn(auth, 'logOut');
      await dispatch(actions.signOutFromAccount());

      expect(auth.logOut).toHaveBeenCalled();
    });

    it('should not logout from the account', async () => {
      updateStore({
        app: {...appStateMock, otherAccounts: [{}]},
      } as unknown as AppState);
      const auth = appStateMock.auth as OAuth2;
      jest.spyOn(auth, 'logOut');
      await dispatch(actions.signOutFromAccount());

      expect(auth.logOut).toHaveBeenCalled();
      expect(apiMock.user.logout).toHaveBeenCalled();
    });

    it('should unsubscribe from push notifications in any case', async () => {
      setRegistered(false);
      await dispatch(actions.signOutFromAccount());

      expect(PushNotifications.unregister).toHaveBeenCalled();
    });

    it('should unsubscribe from push notifications', async () => {
      setRegistered(true);
      await dispatch(actions.signOutFromAccount());

      expect(PushNotifications.unregister).toHaveBeenCalled();
    });
  });


  describe('Permissions', () => {
    let actualPermissionsMock: PermissionCacheItem[];
    let cachedPermissionsMock: PermissionCacheItem[];
    let permissionItemMock: PermissionCacheItem;
    beforeEach(() => {
      permissionItemMock = {
        permission: {
          key: 'permissionName',
        },
      } as PermissionCacheItem;
      cachedPermissionsMock = [permissionItemMock];
      actualPermissionsMock = [permissionItemMock, permissionItemMock];
      setStoreAndCurrentUser({} as User);
      jest
        .spyOn(permissionsHelper, 'loadPermissions')
        .mockResolvedValueOnce(actualPermissionsMock);
    });

    it('should load permissions', async () => {
      await dispatch(actions.loadUserPermissions());
      expect(permissionsHelper.loadPermissions).toHaveBeenCalledWith(
        authParamsMock.token_type,
        authParamsMock.access_token,
        appStateMock.auth!.PERMISSIONS_CACHE_URL,
      );
      expect(storage.getStorageState().permissions).toEqual(
        actualPermissionsMock,
      );
    });

    it('should not set permissions from cache if there are no any', async () => {
      setCachedPermissions(null);
      await dispatch(actions.loadUserPermissions());
      const storeAction = store.getActions();
      expect(storeAction).toHaveLength(1);
      expect(JSON.stringify(storeAction[0])).toEqual(JSON.stringify({
        type: types.SET_PERMISSIONS,
        permissionsStore: new PermissionsStore(actualPermissionsMock),
        currentUser: appStateMock.auth!.currentUser,
      }));
    });

    it('should update permissions', async () => {
      setCachedPermissions(cachedPermissionsMock);
      await dispatch(actions.loadUserPermissions());
      expect(JSON.stringify(store.getActions()[0])).toEqual(JSON.stringify({
        type: types.SET_PERMISSIONS,
        permissionsStore: new PermissionsStore(actualPermissionsMock),
        currentUser: appStateMock.auth!.currentUser,
      }));
    });

    it('should update permissions cache', async () => {
      jest.spyOn(appActionHelper, 'updateCachedPermissions');
      await dispatch(actions.loadUserPermissions());
      expect(appActionHelper.updateCachedPermissions).toHaveBeenCalledWith(
        actualPermissionsMock,
      );
    });

    function setCachedPermissions(permissions: PermissionCacheItem[] | null) {
      storage.__setStorageState({
        permissions: permissions,
      } as StorageState);
    }
  });


  describe('setYTCurrentUser', () => {
    let currentUserMock: UserCurrent;
    beforeEach(() => {
      currentUserMock = {} as UserCurrent;
      storage.__setStorageState({
        currentUser: currentUserMock,
      } as StorageState);
    });
    it('should set user and cache it', async () => {
      await dispatch(actions.setYTCurrentUser(userMock));

      expect(store.getActions()[0]).toEqual({
        type: types.RECEIVE_USER,
        user: userMock,
      });
      expect(storage.getStorageState().currentUser).toEqual({
        ...currentUserMock,
        ytCurrentUser: userMock,
      });
    });
  });


  describe('initializeApp', () => {
    const searchContextMock = {id: 1};
    const naturalCommentsOrderMock = false;
    beforeEach(() => {
      setStoreAndCurrentUser({} as User);
    });

    it('should initialize OAuth instance', async () => {
      await dispatch(actions.initializeAuth(appConfigMock));
      const storeActions = store.getActions();

      expect(storeActions[0].type).toEqual(types.INITIALIZE_AUTH);
      expect(storeActions[0].auth instanceof OAuth2).toEqual(true);
    });

    it('should set YT current user from cache', async () => {
      fetchMock.mock(`${backendURLMock}/api/config?fields=ring(url,serviceId),mobile(serviceSecret,serviceId),version,build,statisticsEnabled,l10n(language,locale,predefinedQueries)`, {
        version: '2018',
        mobile: {serviceId: 'youtrack'},
        ring: {
          serviceId: 'id',
          url: '/',
        },
      });
      fetchMock.mock(`${backendURLMock}/hub/api/rest/permissions/cache?query=service%3A%7B0-0-0-0-0%7D%20or%20service%3A%7B%7D&fields=permission%2Fkey%2Cglobal%2Cprojects%28id%29`, {});
      fetchMock.mock(`${backendURLMock}/api/userNotifications/subscribe?fields=token&$top=-1`, {});
      jest.spyOn(actions, 'completeInitialization');
      userMock = mocks.createUserMock({
        id: 2,
        profiles: {
          general: {
            searchContext: searchContextMock,
          },
          appearance: {
            naturalCommentsOrder: naturalCommentsOrderMock,
          },
        },
      });
      await setYTCurrentUser(userMock);
      await dispatch(actions.initializeApp(appConfigMock));
      const action = store.getActions()[0];
      expect(action.user.profiles.general.searchContext).toEqual(
        searchContextMock,
      );
      expect(action.user.profiles.appearance.naturalCommentsOrder).toEqual(
        naturalCommentsOrderMock,
      );
      expect(action).toEqual({
        type: types.RECEIVE_USER,
        user: {
          ...userMock,
          id: 2,
          profiles: {
            general: {
              useMarkup: true,
              searchContext: searchContextMock,
            },
            appearance: {
              useAbsoluteDates: true,
              naturalCommentsOrder: naturalCommentsOrderMock,
            },
            notifications: {},
            issuesList: {},
            timetracking: {
              isTimeTrackingAvailable: true,
            },
            helpdesk: {
              helpdeskFolder: expect.any(Object),
            },
          },
        },
      });
    });
  });


  describe('completeInitialization', () => {
    beforeEach(() => {
      setAppStateNetworkConnected(true);
      const foldersMock = createInboxFoldersMock();
      (apiMock.inbox.getFolders as jest.Mock).mockResolvedValue(foldersMock);
    });

    it('should check for inbox thread update', async () => {
      jest.spyOn(feature, 'checkVersion').mockReturnValueOnce(true);

      await dispatch(actions.completeInitialization());
      expect(apiMock.inbox.getFolders).toHaveBeenCalled();
    });

    it('should not check for inbox thread update', async () => {
      jest.spyOn(feature, 'checkVersion').mockReturnValueOnce(false);
      await dispatch(actions.completeInitialization());
      expect(apiMock.inbox.getFolders).not.toHaveBeenCalled();
    });
  });


  describe('inboxCheckUpdateStatus', () => {
    let foldersMock: InboxFolder[];
    beforeEach(() => {
      setAppStateNetworkConnected(true);
      foldersMock = createInboxFoldersMock();
    });

    it('should load inbox thread folders without `start` parameter', async () => {
      mocks.setStorage({
        inboxThreadsCache: {
          [folderIdAllKey]: [],
        },
      });
      await dispatch(actions.inboxCheckUpdateStatus());
      expect(apiMock.inbox.getFolders).toHaveBeenCalledWith(undefined);
    });

    it('should load inbox thread folders with `start` parameter - a max value from all folders` lasSeen', async () => {
      const notifiedMock = 3;
      mocks.setStorage({
        inboxThreadsCache: {
          [folderIdAllKey]: [
            mocks.createThreadMock({
              notified: notifiedMock,
            }),
            mocks.createThreadMock({
              notified: 2,
            }),
          ],
        },
      });
      await dispatch(actions.inboxCheckUpdateStatus());
      expect(apiMock.inbox.getFolders).toHaveBeenCalledWith(notifiedMock + 1);
    });

    it('should set inbox thread folders', async () => {
      (apiMock.inbox.getFolders as jest.Mock).mockResolvedValueOnce(foldersMock);
      await dispatch(actions.inboxCheckUpdateStatus());
      expect(store.getActions()[0]).toEqual({
        type: types.INBOX_THREADS_FOLDERS,
        inboxThreadsFolders: foldersMock,
      });
    });

    it('should not set inbox thread folders on error', async () => {
      (apiMock.inbox.getFolders as jest.Mock).mockRejectedValueOnce(new Error());
      await dispatch(actions.inboxCheckUpdateStatus());
      expect(store.getActions()).toHaveLength(0);
    });
  });


  describe('Redirect to a default route on start', () => {
    beforeEach(() => {
      jest.spyOn(appActionHelper, 'getCachedPermissions');
      jest.spyOn(routerHelper, 'navigateToRouteById');
    });

    it('should not redirect user to `Issues screen` if no permissions are cached', async () => {
      (appActionHelper.getCachedPermissions as jest.Mock).mockReturnValueOnce(null);


      await dispatch(actions.initializeApp(appConfigMock));

      expect(routerHelper.navigateToRouteById).not.toHaveBeenCalled();
    });

    it.skip('should redirect to `Issues screen`', async () => {
      (appActionHelper.getCachedPermissions as jest.Mock).mockReturnValueOnce([]);
      setStoreAndCurrentUser({guest: false} as User);

      await dispatch(actions.initializeApp(appConfigMock));

      expect(routerHelper.navigateToRouteById).toHaveBeenCalled();
    });
  });


  describe('subscribeToURL', () => {
    const activityIdMock = `1`;
    beforeAll(async () => jest.useFakeTimers({advanceTimers: true}));
    beforeEach(async () => {
      setStoreAndCurrentUser({} as User);
    });

    it('should invoke URL handler', async () => {
      jest.spyOn(urlUtils, 'openByUrlDetector');

      await assert();

      expect(urlUtils.openByUrlDetector).toHaveBeenCalled();
    });


    describe('Navigate to an issue', () => {
      const issueIdMock = `I-1`;
      beforeEach(() => {
        Router.Issue = jest.fn();
      });

      it('should navigate to an issue', async () => {
        await assert(`${backendURLMock}/issue/${issueIdMock}`);

        setTimeout(() => {
          expect(Router.Issue).toHaveBeenCalledWith(
            {issueId: issueIdMock}, {forceReset: true}
          );
        }, 100);
      });

      it('should navigate to an issue and switch to `Activity` tab', async () => {
        await assert(`${backendURLMock}/issue/${issueIdMock}#focus=Comments-${activityIdMock}`);

        setTimeout(() => {
          expect(Router.Issue).toHaveBeenCalledWith(
            {issueId: issueIdMock, navigateToActivity: activityIdMock}, {forceReset: true}
          );
        }, 100);
      });
    });


    describe.skip('Navigate to an article', () => {
      const articleIdMock = `A-A-1`;
      beforeEach(() => {
        Router.Article = jest.fn();
      });

      it('should navigate to an article', async () => {
        await assert(`${backendURLMock}/articles/${articleIdMock}`);

        setTimeout(() => {
          expect(Router.Article).toHaveBeenCalledWith(
            {articlePlaceholder: {id: articleIdMock}}, {forceReset: true}
          );
        }, 100);
      });

      it('should navigate to an article and switch to `Activity` tab', async () => {
        await assert(`${backendURLMock}/articles/${articleIdMock}#focus=Comments-${activityIdMock}`);

        setTimeout(() => {
          expect(Router.Article).toHaveBeenCalledWith(
            {articlePlaceholder: {id: articleIdMock}, navigateToActivity: activityIdMock}, {forceReset: true}
          );
        });
      });
    });

    async function assert(url = '') {
      (Linking.getInitialURL as jest.Mock).mockResolvedValueOnce(url);
      await actions.subscribeToURL()(jest.fn(), store.getState, () => ({} as API));
    }
  });


  function setStoreAndCurrentUser(ytCurrentUser: User) {
    updateStore({
      app: {
        auth: createAuthInstanceMock(ytCurrentUser),
      },
    } as AppState);
    setYTCurrentUser(ytCurrentUser);
  }

  function setYTCurrentUser(ytCurrentUser: User) {
    storage.__setStorageState({
      currentUser: {ytCurrentUser},
    } as StorageState);
  }

  function setRegistered(isRegistered: boolean) {
    storage.__setStorageState({
      isRegisteredForPush: isRegistered,
    } as StorageState);
  }

  function updateStore(state: AppState) {
    store = storeMock(state);
    dispatch = store.dispatch;
  }

  function createAuthInstanceMock(currentUser?: User): OAuth2 {
    appConfigMock = {
      l10n: {
        language: '',
        locale: '',
      },
      build: '',
      backendUrl: backendURLMock,
      statisticsEnabled: true,
      version: '1.1',
      auth: {
        clientId: '',
        serverUri: `${backendURLMock}/hub`,
        landingUrl: '',
        scopes: '',
        youtrackServiceId: '',
      },
    } as AppConfig;
    const authMock = new OAuth2(appConfigMock, () => {});
    authParamsMock = {
      token_type: 'token_type',
      access_token: 'access_token',
    } as AuthParams;
    authMock.setAuthParams(authParamsMock);
    if (currentUser) {
      authMock.setCurrentUser(currentUser as unknown as UserHub);
    }
    return authMock;
  }

  function createAPIMock() {
    return {
      getUserAgreement: jest.fn().mockResolvedValue({}),
      user: {
        getUser: jest.fn().mockResolvedValue({}),
        getUserFolders: jest.fn().mockResolvedValue([{}]),
        logout: jest.fn().mockResolvedValue([{}]),
      },
      inbox: {
        getFolders: jest.fn().mockResolvedValue([]),
      },
      globalSettings: {
        getSettings: jest.fn().mockResolvedValue([{}]),
      },
      config: {backendUrl: backendURLMock},
    } as unknown as API;
  }

  function setAppStateNetworkConnected(isConnected = true) {
    updateStore({
      app: {
        ...appStateMock,
        networkState: {
          isConnected,
        },
      },
    } as AppState);
  }
});

function createInboxFoldersMock() {
  return [
    {
      id: 'direct',
      lastNotified: 2,
      lastSeen: 1,
    },
    {
      id: 'subscription',
      lastNotified: 1,
      lastSeen: 1,
    },
  ] as InboxFolder[];
}
