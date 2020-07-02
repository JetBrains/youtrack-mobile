import log from '../components/log/log';
import {__setStorageState, populateStorage} from '../components/storage/storage';

import PushNotifications from '../components/push-notifications/push-notifications';
import * as Notification from '../components/notification/notification';

import * as actions from './app-actions';

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Router from '../components/router/router';
import {CUSTOM_ERROR_MESSAGE, REGISTRATION_ERRORS, UNSUPPORTED_ERRORS} from '../components/error/error-messages';
import PermissionsHelper from '../components/permissions-store/permissions-helper';

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
        logOut: authLogOutMock,
        getPermissionsCacheURL: jest.fn(() => permissionsCacheURLMock),
        authParams: {
          token_type: 'token_type',
          access_token: 'access_token'
        },
        config: {
          backendUrl: backendURLMock,
          serverUri: `${backendURLMock}/hub`
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

        expect(Notification.notifyError).toHaveBeenCalledWith(CUSTOM_ERROR_MESSAGE.PUSH_NOTIFICATION_REGISTRATION, registrationErrorMock);
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
          message: errorMessageMock
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
    beforeEach(() => {
      createStore();
    });

    it('should load permissions', async () => {
      const permissionsMock = [];
      jest.spyOn(PermissionsHelper, 'loadPermissions').mockResolvedValueOnce(permissionsMock);

      await store.dispatch(actions.loadUserPermissions());

      expect(PermissionsHelper.loadPermissions).toHaveBeenCalledWith(
        appStateMock.auth.authParams.token_type,
        appStateMock.auth.authParams.access_token,
        permissionsCacheURLMock
      );
    });

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


