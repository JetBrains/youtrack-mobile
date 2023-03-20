import {Linking} from 'react-native';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from './app-actions';
import * as appActionHelper from './app-actions-helper';
import * as Notification from 'components/notification/notification';
import * as storage from 'components/storage/storage';
import * as storageOauth from 'components/storage/storage__oauth';
import * as types from './action-types';
import * as urlUtils from '../components/open-url-handler/open-url-handler';
import OAuth2 from 'components/auth/oauth2';
import log from 'components/log/log';
import mocks from '../../test/mocks';
import permissionsHelper from 'components/permissions-store/permissions-helper';
import PermissionsStore from 'components/permissions-store/permissions-store';
import PushNotifications from 'components/push-notifications/push-notifications';
import Router from 'components/router/router';
import {folderIdAllKey} from 'views/inbox-threads/inbox-threads-helper';

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
}));

jest.mock('react-native/Libraries/Linking/Linking', () => ({
  getInitialURL: jest.fn(),
  addEventListener: jest.fn(),
}));

const backendURLMock = 'https://example.com';
let appConfigMock;
let apiMock;
let appStateMock;
let store;
let userMock;
let authParamsMock;

const getApi = () => apiMock;

const middlewares = [thunk.withExtraArgument(getApi)];
const storeMock = configureMockStore(middlewares);
describe('app-actions', () => {
  beforeEach(() => jest.restoreAllMocks());
  beforeEach(async () => {
    jest
      .spyOn(storageOauth, 'getStoredSecurelyAuthParams')
      .mockImplementationOnce(() => authParamsMock);
    apiMock = createAPIMock();
    appStateMock = {
      auth: createAuthInstanceMock(),
    };
    updateStore({...appStateMock});
    await storage.populateStorage();
  });
  describe('subscribeToPushNotifications', () => {
    beforeEach(() => {
      jest
        .spyOn(PushNotifications, 'register')
        .mockReturnValue(Promise.resolve());
      jest.spyOn(PushNotifications, 'initialize');
      jest.spyOn(Notification, 'notifyError');
      jest.spyOn(Notification, 'notify');
      Notification.setNotificationComponent({
        show: jest.fn(),
      });
      setRegistered(false);
    });
    describe('Registration success', () => {
      it('should subscribe if a device is not registered', async () => {
        await store.dispatch(actions.subscribeToPushNotifications());
        expect(PushNotifications.register).toHaveBeenCalled();
        expect(PushNotifications.initialize).toHaveBeenCalled();
      });
      it('should not subscribe, but initialize if a device is already registered', async () => {
        setRegistered(true);
        await store.dispatch(actions.subscribeToPushNotifications());
        expect(PushNotifications.register).not.toHaveBeenCalled();
        expect(PushNotifications.initialize).toHaveBeenCalled();
      });
    });
    describe('Registration error', () => {
      const registrationErrorMock = new Error('Registration failed');
      beforeEach(() => {
        jest.spyOn(log, 'warn');
      });
      it('should not initialize if registration failed', async () => {
        setRegistrationThrow();
        await store.dispatch(actions.subscribeToPushNotifications());
        expect(PushNotifications.register).toHaveBeenCalled();
        expect(PushNotifications.initialize).not.toHaveBeenCalled();
      });
      it('should show error screen if registration failed', async () => {
        setRegistrationThrow();
        await store.dispatch(actions.subscribeToPushNotifications());
        expect(Notification.notifyError).toHaveBeenCalledWith(
          registrationErrorMock,
        );
      });
      it('should not initialize if a registration service returns error', async () => {
        setRegistrationServiceReturnError();
        await store.dispatch(actions.subscribeToPushNotifications());
        expect(PushNotifications.register).toHaveBeenCalled();
        expect(PushNotifications.initialize).not.toHaveBeenCalled();
      });
      it('should log error and should not show error screen if a registration service returns error', async () => {
        setRegistrationServiceReturnError();
        await store.dispatch(actions.subscribeToPushNotifications());
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


  describe('removeAccountOrLogOut', () => {
    beforeEach(() => {
      jest.spyOn(PushNotifications, 'unregister').mockResolvedValueOnce({});
      updateStore({
        app: {...appStateMock, otherAccounts: []},
      });
    });

    it('should logout from the only account', async () => {
      jest.spyOn(appStateMock.auth, 'logOut');
      await store.dispatch(actions.removeAccountOrLogOut());

      expect(appStateMock.auth.logOut).toHaveBeenCalled();
    });

    it('should not logout from the account', async () => {
      updateStore({
        app: {...appStateMock, otherAccounts: [{}]},
      });
      jest.spyOn(appStateMock.auth, 'logOut');
      await store.dispatch(actions.removeAccountOrLogOut());

      expect(appStateMock.auth.logOut).toHaveBeenCalled();
      expect(apiMock.user.logout).toHaveBeenCalled();
    });

    it('should not unsubscribe from push notifications', async () => {
      setRegistered(false);
      await store.dispatch(actions.removeAccountOrLogOut());

      expect(PushNotifications.unregister).not.toHaveBeenCalled();
    });

    it('should unsubscribe from push notifications', async () => {
      setRegistered(true);
      await store.dispatch(actions.removeAccountOrLogOut());

      expect(PushNotifications.unregister).toHaveBeenCalled();
    });
  });


  describe('Permissions', () => {
    let actualPermissionsMock;
    let cachedPermissionsMock;
    let permissionItemMock;
    beforeEach(() => {
      permissionItemMock = {
        permission: {
          key: 'permissionName',
        },
      };
      cachedPermissionsMock = [permissionItemMock];
      actualPermissionsMock = [permissionItemMock, permissionItemMock];
      setStoreAndCurrentUser();
      jest
        .spyOn(permissionsHelper, 'loadPermissions')
        .mockResolvedValueOnce(actualPermissionsMock);
    });
    it('should load permissions', async () => {
      await store.dispatch(actions.loadUserPermissions());
      expect(permissionsHelper.loadPermissions).toHaveBeenCalledWith(
        authParamsMock.token_type,
        authParamsMock.access_token,
        appStateMock.auth.PERMISSIONS_CACHE_URL,
      );
      expect(storage.getStorageState().permissions).toEqual(
        actualPermissionsMock,
      );
    });
    it('should not set permissions from cache if there are no any', async () => {
      setCachedPermissions(null);
      await store.dispatch(actions.loadUserPermissions());
      const storeAction = store.getActions();
      expect(storeAction).toHaveLength(1);
      expect(storeAction[0]).toEqual({
        type: types.SET_PERMISSIONS,
        permissionsStore: new PermissionsStore(actualPermissionsMock),
        currentUser: appStateMock.auth.currentUser,
      });
    });
    it('should update permissions', async () => {
      setCachedPermissions(cachedPermissionsMock);
      await store.dispatch(actions.loadUserPermissions());
      expect(store.getActions()[0]).toEqual({
        type: types.SET_PERMISSIONS,
        permissionsStore: new PermissionsStore(actualPermissionsMock),
        currentUser: appStateMock.auth.currentUser,
      });
    });
    it('should update permissions cache', async () => {
      jest.spyOn(appActionHelper, 'updateCachedPermissions');
      await store.dispatch(actions.loadUserPermissions());
      expect(appActionHelper.updateCachedPermissions).toHaveBeenCalledWith(
        actualPermissionsMock,
      );
    });

    function setCachedPermissions(permissions) {
      storage.__setStorageState({
        permissions: permissions,
      });
    }
  });
  describe('setYTCurrentUser', () => {
    let currentUserMock;
    beforeEach(() => {
      currentUserMock = {};
      storage.__setStorageState({
        currentUser: currentUserMock,
      });

      userMock = mocks.createUserMock();
    });
    it('should set user and cache it', async () => {
      await store.dispatch(actions.setYTCurrentUser(userMock));

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
  const searchContextMock = {
    id: 1,
  };
  const naturalCommentsOrderMock = false;
  describe('initializeApp', () => {
    beforeEach(() => {
      setStoreAndCurrentUser({});
      jest
        .spyOn(storageOauth, 'getStoredSecurelyAuthParams')
        .mockImplementationOnce(() => authParamsMock);
    });
    it('should initialize OAuth instance', async () => {
      await store.dispatch(actions.initializeApp(appConfigMock));
      expect(store.getActions()[0].type).toEqual(types.INITIALIZE_AUTH);
      expect(store.getActions()[0].auth instanceof OAuth2).toEqual(true);
      expect(store.getActions()[0].auth.authParams).toEqual(authParamsMock);
    });
    it('should set YT current user from cache', async () => {
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
      await store.dispatch(actions.initializeApp(appConfigMock));
      const action = store.getActions()[1];
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
          },
        },
      });
    });
  });
  describe('completeInitialization', () => {
    it('should check for inbox thread update', async () => {
      setAppStateNetworkConnected(true);
      const foldersMock = createInboxFoldersMock();
      apiMock.inbox.getFolders.mockResolvedValueOnce(foldersMock);
      await store.dispatch(actions.completeInitialization());
      expect(apiMock.inbox.getFolders).toHaveBeenCalled();
    });
  });
  describe('inboxCheckUpdateStatus', () => {
    let foldersMock;
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
      await store.dispatch(actions.inboxCheckUpdateStatus());
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
      await store.dispatch(actions.inboxCheckUpdateStatus());
      expect(apiMock.inbox.getFolders).toHaveBeenCalledWith(notifiedMock + 1);
    });
    it('should set inbox thread folders', async () => {
      apiMock.inbox.getFolders.mockResolvedValueOnce(foldersMock);
      await store.dispatch(actions.inboxCheckUpdateStatus());
      expect(store.getActions()[0]).toEqual({
        type: types.INBOX_THREADS_FOLDERS,
        inboxThreadsFolders: foldersMock,
      });
    });
    it('should not set inbox thread folders on error', async () => {
      apiMock.inbox.getFolders.mockRejectedValueOnce(new Error());
      await store.dispatch(actions.inboxCheckUpdateStatus());
      expect(store.getActions()).toHaveLength(0);
    });
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
    ];
  }

  describe('redirectToRoute', () => {
    beforeEach(() => {
      jest
        .spyOn(appActionHelper, 'getCachedPermissions')
        .mockReturnValueOnce([]);
      jest.spyOn(appActionHelper, 'storeYTCurrentUser');
    });
    it('should redirect to issues', async () => {
      setStoreAndCurrentUser({
        guest: false,
      });
      const isRedirected = await store.dispatch(
        actions.redirectToRoute(appConfigMock),
      );
      expect(isRedirected).toEqual(true);
    });
    it('should not redirect guest user to issues', async () => {
      setStoreAndCurrentUser({
        guest: true,
      });
      const isRedirected = await store.dispatch(
        actions.redirectToRoute(appConfigMock),
      );
      await expect(isRedirected).toEqual(false);
    });
    it('should not redirect user to issues if no permissions are cached', async () => {
      jest
        .spyOn(appActionHelper, 'getCachedPermissions')
        .mockReturnValueOnce(null);
      setStoreAndCurrentUser({
        guest: true,
      });
      const isRedirected = await store.dispatch(
        actions.redirectToRoute(appConfigMock),
      );
      await expect(isRedirected).toEqual(false);
    });
  });


  describe('subscribeToURL', () => {
    const activityIdMock = `1`;
    let subscribeToURLHandler;
    beforeAll(async () => jest.useFakeTimers({advanceTimers: true}));
    beforeEach(async () => {
      jest.clearAllTimers();
      setStoreAndCurrentUser({});
      subscribeToURLHandler = actions.subscribeToURL();
    });

    afterEach(() => jest.restoreAllMocks());

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
        jest.advanceTimersByTime(100);

        expect(Router.Issue).toHaveBeenCalledWith(
          {issueId: issueIdMock}, {forceReset: true}
        );
      });

      it('should navigate to an issue and switch to `Activity` tab', async () => {
        await assert(`${backendURLMock}/issue/${issueIdMock}#focus=Comments-${activityIdMock}`);
        jest.advanceTimersByTime(100);

        expect(Router.Issue).toHaveBeenCalledWith(
          {issueId: issueIdMock, navigateToActivity: activityIdMock}, {forceReset: true}
        );
      });
    });


    describe('Navigate to an article', () => {
      const articleIdMock = `A-A-1`;
      beforeEach(() => {
        Router.Article = jest.fn();
      });

      it('should navigate to an article', async () => {
        await assert(`${backendURLMock}/articles/${articleIdMock}`);
        jest.advanceTimersByTime(100);

        expect(Router.Article).toHaveBeenCalledWith(
          {articlePlaceholder: {id: articleIdMock}}, {forceReset: true}
        );
      });

      it('should navigate to an article and switch to `Activity` tab', async () => {
        await assert(`${backendURLMock}/articles/${articleIdMock}#focus=Comments-${activityIdMock}`);
        jest.advanceTimersByTime(100);

        expect(Router.Article).toHaveBeenCalledWith(
          {articlePlaceholder: {id: articleIdMock}, navigateToActivity: activityIdMock}, {forceReset: true}
        );
      });
    });

    async function assert(url = '') {
      Linking.getInitialURL.mockResolvedValue(url);
      await subscribeToURLHandler(jest.fn(), store.getState, () => {});
    }
  });


  function setStoreAndCurrentUser(ytCurrentUser) {
    updateStore({
      app: {
        auth: createAuthInstanceMock(ytCurrentUser),
      },
    });
    setYTCurrentUser(ytCurrentUser);
  }

  function setYTCurrentUser(ytCurrentUser) {
    storage.__setStorageState({
      currentUser: {
        ytCurrentUser,
      },
    });
  }

  function setRegistered(isRegistered) {
    storage.__setStorageState({
      isRegisteredForPush: isRegistered,
    });
  }

  function updateStore(state: Record<string, any> | null | undefined = {}) {
    store = storeMock(state);
  }

  function createAuthInstanceMock(currentUser) {
    appConfigMock = {
      l10n: {},
      backendUrl: backendURLMock,
      auth: {
        serverUri: `${backendURLMock}/hub`,
      },
    };
    const authMock = new OAuth2(appConfigMock);
    authParamsMock = {
      token_type: 'token_type',
      access_token: 'access_token',
    };
    authMock.setAuthParams(authParamsMock);
    if (currentUser) {
      authMock.setCurrentUser(currentUser);
    }
    return authMock;
  }

  function createAPIMock() {
    return {
      getUserAgreement: jest.fn(() => Promise.resolve({})),
      user: {
        getUser: jest.fn(() => Promise.resolve({})),
        getUserFolders: jest.fn(() => Promise.resolve([{}])),
        logout: jest.fn(() => Promise.resolve()),
      },
      inbox: {
        getFolders: jest.fn(() => Promise.resolve([])),
      },
    };
  }

  function setAppStateNetworkConnected(isConnected = true) {
    updateStore({
      app: {
        ...appStateMock,
        networkState: {
          isConnected,
        },
      },
    });
  }
});
