import React from 'react';
import {Provider} from 'react-redux';

import {render, cleanup, fireEvent, screen, act} from '@testing-library/react-native';

import * as appActions from 'actions/app-actions';
import * as feature from 'components/feature/feature';
import Menu, {menuPollInboxStatusDelay} from './menu';
import mocks from 'test/mocks';
import Router from 'components/router/router';
import {rootRoutesList, routeMap} from 'app-routes';

import type API from 'components/api/api';
import type OAuth2 from 'components/auth/oauth2';
import {AppState} from 'reducers';
import {MockStore} from 'redux-mock-store';
import {RootState} from 'reducers/app-reducer';
import {User} from 'types/User';

jest.mock('components/feature/feature');

let apiMock: API;
const getApi = () => apiMock;

const createStoreMock = mocks.createMockStore(getApi);
const rootTestID = 'menu';

describe('<Menu/>', () => {
  let storeMock: MockStore;
  let stateMock: AppState;
  let router: typeof Router;

  beforeEach(() => {
    jest.restoreAllMocks();
    stateMock = {
      app: {
        auth: {} as OAuth2,
        inboxThreadsFolders: [],
        isChangingAccount: false,
        otherAccounts: [],
        user: {} as User,
        globalSettings: {},
      } as unknown as RootState,
    } as AppState;
    storeMock = createStoreMock(stateMock);
    router = Router;
  });

  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(feature, 'checkVersion');
  });

  afterEach(cleanup);


  describe('Render', () => {
    it('should render component', () => {
      const {queryByTestId} = doRender();
      const queryByTestId1 = queryByTestId(rootTestID);

      expect(queryByTestId1).toBeTruthy();
    });

    it('should render menu `Issue` item', async () => {
      const {getByTestId} = doRender();

      expect(getByTestId('test:id/menuIssues')).toBeTruthy();
    });

    it('should render menu `Agile Boards` item', async () => {
      const {getByTestId} = doRender();

      expect(getByTestId('test:id/menuAgile')).toBeTruthy();
    });

    it('should render menu `Knowledge Base` item', async () => {
      (feature.checkVersion as jest.Mock).mockReturnValue(true);
      const {getByTestId} = doRender();

      expect(getByTestId('test:id/menuKnowledgeBase')).toBeTruthy();
    });

    it('should not render menu `Knowledge Base` item', async () => {
      (feature.checkVersion as jest.Mock).mockReturnValue(false);

      const {getByTestId} = doRender();

      expect(() => {
        getByTestId('test:id/menuKnowledgeBase');
      }).toThrow();
    });

    it('should render menu `Notifications` item', async () => {
      (feature.checkVersion as jest.Mock).mockReturnValueOnce(true);

      const {getByTestId} = doRender();

      expect(getByTestId('test:id/menuNotifications')).toBeTruthy();
    });

    it('should not render menu `Notifications` item', async () => {
      (feature.checkVersion as jest.Mock).mockReturnValue(false);
      const {getByTestId} = doRender();

      expect(() => {
        getByTestId('test:id/menuNotifications');
      }).toThrow();
    });

    it('should render menu `Settings` item', async () => {
      const {getByTestId} = doRender();

      expect(getByTestId('test:id/menuSettings')).toBeTruthy();
    });

    it('should render menu container if `auth` is not provided', () => {
      stateMock.app.auth = null;
      storeMock = createStoreMock(stateMock);

      const {queryByTestId} = doRender();

      expect(queryByTestId('menu')).toBeTruthy();
    });

    it('should render menu container if `user` is not provided', () => {
      stateMock.app.user = null;
      storeMock = createStoreMock(stateMock);

      const {queryByTestId} = doRender();

      expect(queryByTestId('menu')).toBeTruthy();
    });
  });


  describe('Navigation', () => {
    beforeEach(() => {
      mockRouter();
      jest.spyOn(router, 'navigate');
    });

    it('should not navigate if `Menu` disabled', () => {
      stateMock.app.isChangingAccount = true;
      storeMock = createStoreMock(stateMock);
      const {getByTestId} = doRender();

      fireEvent.press(getByTestId('test:id/menuAgile'));

      expect(Router.navigate).toHaveBeenCalledTimes(0);
    });

    it('should navigate to the root route', () => {
      const {getByTestId} = doRender();

      fireEvent.press(getByTestId('test:id/menuIssues'));
      fireEvent.press(getByTestId('test:id/menuAgile'));

      expect(Router.navigate).toHaveBeenCalledTimes(2);
    });

    it('should not navigate to the same root route', () => {
      const {getByTestId} = doRender();

      fireEvent.press(getByTestId('test:id/menuIssues'));
      fireEvent.press(getByTestId('test:id/menuIssues'));

      expect(Router.navigate).toHaveBeenCalledTimes(1);
    });

    it('should navigate to a root route if current route is `Issue`', () => {
      const {getByTestId} = doRender();

      fireEvent.press(getByTestId('test:id/menuIssues'));
      act(() => {
        Router.Issue();
      });
      fireEvent.press(getByTestId('test:id/menuIssues'));

      expect(Router.navigate).toHaveBeenCalledTimes(3);
    });

    it('should activate pressed root route', () => {
      const {getByTestId} = doRender();

      fireEvent.press(getByTestId('test:id/menuIssues'));

      expect(getByTestId('test:id/menuIssuesIcon')).toHaveProp('isActive', true);

      fireEvent.press(getByTestId('test:id/menuAgile'));

      expect(getByTestId('test:id/menuIssuesIcon')).toHaveProp('isActive', false);
    });
  });


  describe('Inbox status polling', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());
    beforeEach(() => {
      mockRouter();
      jest.spyOn(appActions, 'inboxCheckUpdateStatus');
    });


    describe('Inbox Threads', () => {

      describe('Inbox Threads available', () => {
        beforeEach(() => {
          (feature.checkVersion as jest.Mock).mockReturnValue(true);
        });

        it('should start polling without waiting', () => {
          const {getByTestId} = doRender();

          fireEvent.press(getByTestId('test:id/menuIssues'));

          expect(appActions.inboxCheckUpdateStatus).toHaveBeenCalledTimes(1);
        });

        it('should poll status', async () => {
          const {getByTestId} = doRender();

          fireEvent.press(getByTestId('test:id/menuIssues'));
          act(() => {
            jest.advanceTimersByTime(menuPollInboxStatusDelay);
          });

          expect(appActions.inboxCheckUpdateStatus).toHaveBeenCalledTimes(2);
        });

        it('should not stop polling status inside inbox threads', async () => {
          const {getByTestId} = doRender();

          fireEvent.press(getByTestId('test:id/menuNotifications'));
          act(() => {
            jest.advanceTimersByTime(menuPollInboxStatusDelay);
          });

          expect(appActions.inboxCheckUpdateStatus).toHaveBeenCalled();
        });
      });


      describe('Inbox Threads unavailable', () => {
        beforeEach(() => {
          (feature.checkVersion as jest.Mock).mockReturnValue(false);
        });

        it('should not poll status if the feature is unavailable', () => {
          const {getByTestId} = doRender();
          fireEvent.press(getByTestId('test:id/menuIssues'));
          act(() => {
            jest.advanceTimersByTime(menuPollInboxStatusDelay);
          });

          expect(appActions.inboxCheckUpdateStatus).not.toHaveBeenCalled();
        });
      });
    });


    describe('Help Desk', () => {
      it('should not be enable because of older server version', () => {
        setUp(false, true);

        doRender();

        expect(screen.queryByTestId('test:id/menuTickets')).toBeNull();
      });

      it('should not be enable because of global settings', () => {
        setUp(true, false);

        doRender();

        expect(screen.queryByTestId('test:id/menuTickets')).toBeNull();
      });

      it('should be enable', () => {
        setUp(true, true);

        doRender();

        expect(screen.getByTestId('test:id/menuTickets')).toBeTruthy();
      });

      function setUp(versionMatches: boolean, isEnabled: boolean) {
        (feature.checkVersion as jest.Mock).mockReturnValue(versionMatches);
        stateMock.app.globalSettings = {helpdeskEnabled: isEnabled, type: 'public'};
        storeMock = createStoreMock(stateMock);
      }
    });
  });

  function mockRouter() {
    Router.setNavigator(mocks.navigatorMock);
    rootRoutesList.map(routeName => {
      Router.registerRoute({
        name: routeName,
        component: null,
      });
      return routeName;
    });
    Router.registerRoute({
      name: routeMap.Issue,
      component: null,
    });
  }

  function doRender() {
    return render(
      <Provider store={storeMock}>
        <Menu/>
      </Provider>,
    );
  }
});
