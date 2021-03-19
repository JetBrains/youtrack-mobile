import log from '../components/log/log';
import {__setStorageState, populateStorage} from '../components/storage/storage';

import PushNotifications from '../components/push-notifications/push-notifications';
import * as Notification from '../components/notification/notification';

import * as actions from './app-actions';
import * as types from './action-types';

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Router from '../components/router/router';
import {CUSTOM_ERROR_MESSAGE, REGISTRATION_ERRORS, UNSUPPORTED_ERRORS} from '../components/error/error-messages';
import permissionsHelper from '../components/permissions-store/permissions-helper';
import * as appActionHelper from './app-actions-helper';
import PermissionsStore from '../components/permissions-store/permissions-store';

let apiMock;
let store;
const getApi = () => apiMock;
const middlewares = [thunk.withExtraArgument(getApi)];
const storeMock = configureMockStore(middlewares);

const backendURLMock = 'https://example.com';
const permissionsCacheURLMock = `${backendURLMock}/permissionsCache`;
let authLogOutMock;
let appStateMock;


describe('app-actions', () => {
  beforeEach(() => jest.restoreAllMocks());

  beforeEach(async () => {
    apiMock = {};
    authLogOutMock = jest.fn();

    appStateMock = {
      auth: {
        currentUser: {},
        logOut: authLogOutMock,
        getPermissionsCacheURL: jest.fn(() => permissionsCacheURLMock),
        authParams: {
          token_type: 'token_type',
          access_token: 'access_token',
        },
        config: {
          backendUrl: backendURLMock,
          serverUri: `${backendURLMock}/hub`,
        },
      },
    };

    updateStore({});
    await populateStorage();
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
      const errorMessageMock = REGISTRATION_ERRORS[0];

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

        expect(Notification.notify).toHaveBeenCalledWith(CUSTOM_ERROR_MESSAGE.PUSH_NOTIFICATION_REGISTRATION, registrationErrorMock);
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

        expect(Notification.notifyError).not.toHaveBeenCalled();
        expect(log.warn).toHaveBeenCalledWith(UNSUPPORTED_ERRORS.PUSH_NOTIFICATION_NOT_SUPPORTED);
      });

      function setRegistrationThrow() {
        jest.spyOn(PushNotifications, 'register').mockReturnValue(Promise.reject(registrationErrorMock));
      }

      function setRegistrationServiceReturnError() {
        jest.spyOn(PushNotifications, 'register').mockReturnValue(Promise.reject({
          message: errorMessageMock,
        }));
      }
    });
  });


  describe('removeAccountOrLogOut', () => {
    const copy = Router.EnterServer;
    afterEach(() => Router.EnterServer = copy);
    beforeEach(() => {
      jest.spyOn(PushNotifications, 'unregister').mockResolvedValueOnce({});
      Router.EnterServer = jest.fn();
      createStore();
    });

    it('should logout from the only account', async () => {
      await store.dispatch(actions.removeAccountOrLogOut());

      expect(authLogOutMock).toHaveBeenCalled();
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
      await store.dispatch(actions.loadUserPermissions());

      expect(permissionsHelper.loadPermissions).toHaveBeenCalledWith(
        appStateMock.auth.authParams.token_type,
        appStateMock.auth.authParams.access_token,
        permissionsCacheURLMock
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

      expect(appActionHelper.updateCachedPermissions).toHaveBeenCalledWith(actualPermissionsMock);
    });

    function setCachedPermissions(permissions) {
      __setStorageState({
        permissions: permissions,
      });
    }
  });


  function setRegistered(isRegistered) {
    __setStorageState({isRegisteredForPush: isRegistered});
  }

  function createStore(otherAccounts) {
    appStateMock.otherAccounts = otherAccounts || appStateMock.otherAccounts || [];

    updateStore({app: appStateMock});
  }

  function updateStore(state: ?Object = {}) {
    store = storeMock(state);
  }

});


