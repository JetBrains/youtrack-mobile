import log from '../components/log/log';
import {__setStorageState, populateStorage} from '../components/storage/storage';

import PushNotifications from '../components/push-notifications/push-notifications';
import * as Notification from '../components/notification/notification';

import * as actions from './app-actions';

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Router from '../components/router/router';

let apiMock;
let store;
const getApi = () => apiMock;
const middlewares = [thunk.withExtraArgument(getApi)];
const storeMock = configureMockStore(middlewares);

describe('app-actions', () => {
  beforeEach(async () => {
    apiMock = {};
    updateStore({});
    await populateStorage();
  });

  beforeEach(() => jest.restoreAllMocks());


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
      const errorMessageMock = actions.REGISTRATION_ERRORS[0];

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

        expect(Notification.notifyError).toHaveBeenCalledWith(actions.ERROR_MESSAGE.FAIL, registrationErrorMock);
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
        expect(log.warn).toHaveBeenCalledWith(actions.ERROR_MESSAGE.NOT_SUPPORTED + errorMessageMock);
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
    const URL = 'https://example.com';
    let authLogOutMock;

    beforeEach(() => {
      authLogOutMock = jest.fn();
      jest.spyOn(PushNotifications, 'unregister').mockReturnValue(Promise.resolve());
      Router.EnterServer = jest.fn();
      setAppStateMock();
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

    function setAppStateMock(otherAccounts) {
      const appStateMock = {
        auth: {
          logOut: authLogOutMock,
          config: {backendUrl: URL}
        },
        otherAccounts: otherAccounts || []
      };

      updateStore({app: appStateMock});
    }
  });


  function setRegistered(isRegistered) {
    __setStorageState({isRegisteredForPush: isRegistered});
  }

  function updateStore(state: ?Object = {}) {
    store = storeMock(state);
  }



});


