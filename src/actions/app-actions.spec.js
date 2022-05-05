import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from './app-actions';
import * as appActionHelper from './app-actions-helper';
import * as Notification from 'components/notification/notification';
import * as storage from 'components/storage/storage';
import * as types from './action-types';
import AuthTest from 'components/auth/oauth2';
import log from 'components/log/log';
import mocks from '../../test/mocks';
import permissionsHelper from 'components/permissions-store/permissions-helper';
import PermissionsStore from 'components/permissions-store/permissions-store';
import PushNotifications from 'components/push-notifications/push-notifications';

jest.mock('components/router/router', () => ({
  Home: jest.fn(),
  EnterServer: jest.fn(),
}));

const backendURLMock = 'https://example.com';
const permissionsCacheURLMock = `${backendURLMock}/permissionsCache`;
let apiMock;
let appStateMock;
let store;
let userMock;

const getApi = () => apiMock;
const middlewares = [thunk.withExtraArgument(getApi)];
const storeMock = configureMockStore(middlewares);


describe('app-actions', () => {
  beforeEach(() => jest.restoreAllMocks());

  beforeEach(async () => {
    apiMock = {};

    appStateMock = {
      auth: new AuthTest({
        backendUrl: backendURLMock,
        auth: {
          serverUri: `${backendURLMock}/hub`,
        },
      }),
    };
    appStateMock.auth.authParams = {
      token_type: 'token_type',
      access_token: 'access_token',
    };
    updateStore({});
    await storage.populateStorage();
  });


  describe('subscribeToPushNotifications', () => {
    beforeEach(() => {
      jest.spyOn(PushNotifications, 'register').mockReturnValue(Promise.resolve());
      jest.spyOn(PushNotifications, 'initialize');
      jest.spyOn(Notification, 'notifyError');
      jest.spyOn(Notification, 'notify');
      Notification.setNotificationComponent({show: jest.fn()});
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

        expect(Notification.notifyError).toHaveBeenCalledWith(registrationErrorMock);
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

        expect(Notification.notifyError).toHaveBeenCalledWith(registrationErrorMock);
      });

      function setRegistrationThrow() {
        jest.spyOn(PushNotifications, 'register').mockReturnValue(Promise.reject(registrationErrorMock));
      }

      function setRegistrationServiceReturnError() {
        jest.spyOn(PushNotifications, 'register').mockReturnValue(Promise.reject(registrationErrorMock));
      }
    });
  });


  describe('removeAccountOrLogOut', () => {
    beforeEach(() => {
      jest.spyOn(PushNotifications, 'unregister').mockResolvedValueOnce({});
      createStore();
    });

    it('should logout from the only account', async () => {
      jest.spyOn(appStateMock.auth, 'logOut');

      await store.dispatch(actions.removeAccountOrLogOut());

      expect(appStateMock.auth.logOut).toHaveBeenCalled();
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
      permissionItemMock = {permission: {key: 'permissionName'}};
      cachedPermissionsMock = [permissionItemMock];
      actualPermissionsMock = [
        permissionItemMock,
        permissionItemMock,
      ];

      createStore();
      jest.spyOn(permissionsHelper, 'loadPermissions').mockResolvedValueOnce(actualPermissionsMock);
    });

    it('should load permissions', async () => {
      const tokenTypeMock = 'TOKEN_TYPE';
      const accessTokenMock = 'ACCESS_TOKEN';
      appStateMock.auth.PERMISSIONS_CACHE_URL = permissionsCacheURLMock;
      jest.spyOn(appStateMock.auth, 'getTokenType').mockReturnValueOnce(tokenTypeMock);
      jest.spyOn(appStateMock.auth, 'getAccessToken').mockReturnValueOnce(accessTokenMock);

      await store.dispatch(actions.loadUserPermissions());

      expect(permissionsHelper.loadPermissions).toHaveBeenCalledWith(
        tokenTypeMock,
        accessTokenMock,
        permissionsCacheURLMock
      );
      expect(storage.getStorageState().permissions).toEqual(actualPermissionsMock);
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

      expect(appActionHelper.updateCachedPermissions).toHaveBeenCalledWith(actualPermissionsMock);
    });

    function setCachedPermissions(permissions) {
      storage.__setStorageState({
        permissions: permissions,
      });
    }
  });


  describe('setCurrentUser', () => {
    let currentUserMock;
    let dispatchedObj;
    beforeEach(() => {
      currentUserMock = {};
      storage.__setStorageState({currentUser: currentUserMock});
      jest.spyOn(storage, 'flushStoragePart');
      userMock = mocks.createUserMock();
      dispatchedObj = {
        type: types.RECEIVE_USER,
        user: userMock,
      };
    });

    it('should set user and cache it', async () => {
      await store.dispatch(actions.setCurrentUser(userMock));

      expect(store.getActions()[0]).toEqual(dispatchedObj);
      expect(storage.flushStoragePart).toHaveBeenCalledWith({
        currentUser: {
          ...currentUserMock,
          ytCurrentUser: userMock,
        },
      });
    });

    it('should set user, but not cache it', async () => {
      await store.dispatch(actions.setCurrentUser(userMock, true));

      expect(store.getActions()[0]).toEqual(dispatchedObj);
      expect(storage.flushStoragePart).not.toHaveBeenCalled();
    });
  });


  const searchContextMock = {id: 1};
  const naturalCommentsOrderMock = false;

  describe('initializeApp', () => {
    it('should set YT current user from cache', async () => {
      userMock = mocks.createUserMock({
        id: 2,
        profiles: {
          general: {searchContext: searchContextMock},
          appearance: {naturalCommentsOrder: naturalCommentsOrderMock},
        },
      });
      await initApp(userMock);

      const action = store.getActions()[0];
      expect(action.user.profiles.general.searchContext).toEqual(searchContextMock);
      expect(action.user.profiles.appearance.naturalCommentsOrder).toEqual(naturalCommentsOrderMock);
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

    async function initApp(ytCurrentUser) {
      storage.__setStorageState({currentUser: {ytCurrentUser}});
      await store.dispatch(actions.initializeApp({l10n: {}}));
    }
  });


  function setRegistered(isRegistered) {
    storage.__setStorageState({isRegisteredForPush: isRegistered});
  }

  function createStore(otherAccounts) {
    appStateMock.otherAccounts = otherAccounts || appStateMock.otherAccounts || [];

    updateStore({app: appStateMock});
  }

  function updateStore(state: ?Object = {}) {
    store = storeMock(state);
  }

});
