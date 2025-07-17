import React from 'react';
import {Provider} from 'react-redux';

import {render, cleanup, fireEvent, screen, act} from '@testing-library/react-native';

import * as appActions from 'actions/app-actions';
import * as feature from 'components/feature/feature';
import IssuePermissions from 'components/issue-permissions/issue-permissions';
import Menu, {menuPollInboxStatusDelay} from './menu';
import mocks from 'test/mocks';
import PermissionsStore from 'components/permissions-store/permissions-store';
import Router from 'components/router/router';
import {rootRoutesList, routeMap} from 'app-routes';

import type API from 'components/api/api';
import type OAuth2 from 'components/auth/oauth2';
import type {AppState} from 'reducers';
import type {MockStore} from 'redux-mock-store';
import type {NavigationContainer, NavigationContainerComponent} from 'react-navigation';
import type {PermissionCacheItem} from 'types/Permission';
import type {RootState} from 'reducers/app-reducer';
import type {User} from 'types/User';

type Navigator = NavigationContainer & NavigationContainerComponent;

jest.mock('components/feature/feature');

let apiMock: API;
const getApi = () => apiMock;

const createStoreMock = mocks.createMockStore(getApi);
const rootTestID = 'menu';
let issuePermissions: IssuePermissions;

describe('<Menu/>', () => {
  let storeMock: MockStore;
  let stateMock: AppState;
  let router: typeof Router;

  beforeEach(() => {
    jest.restoreAllMocks();

    const currentUser = mocks.createUserMock()  as unknown as User;
    issuePermissions = new IssuePermissions(
      new PermissionsStore([{permission: {key: 'permissionName'}} as PermissionCacheItem]),
      currentUser
    );
    stateMock = {
      app: {
        auth: {} as OAuth2,
        inboxThreadsFolders: [],
        isChangingAccount: false,
        otherAccounts: [],
        user: currentUser,
        globalSettings: {},
        issuePermissions,
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

    it('should render `Issues`', async () => {
      const {getByTestId} = doRender();

      expect(getByTestId('test:id/menuIssues')).toBeTruthy();
    });

    it('should render `Agile Boards`', async () => {
      const {getByTestId} = doRender();

      expect(getByTestId('test:id/menuAgile')).toBeTruthy();
    });

    it('should not render `Agile Boards` for the reporter', async () => {
      setUserAsReporter();
      doRender();

      expect(screen.queryByTestId('test:id/menuAgile')).toBeNull();
    });

    it('should render `Knowledge Base`', async () => {
      (feature.checkVersion as jest.Mock).mockReturnValue(true);
      jest.spyOn(issuePermissions, 'articleReadAccess').mockReturnValueOnce(true);
      const {getByTestId} = doRender();

      expect(getByTestId('test:id/menuKnowledgeBase')).toBeTruthy();
    });

    it('should not render `Knowledge Base`', async () => {
      (feature.checkVersion as jest.Mock).mockReturnValue(false);
      doRender();

      expect(screen.queryByTestId('test:id/menuKnowledgeBase')).toBeNull();
    });

    it('should not render `Knowledge Base` if user has no general `read article` permission', async () => {
      (feature.checkVersion as jest.Mock).mockReturnValue(true);
      setUserAsReporter();
      doRender();

      expect(screen.queryByTestId('test:id/menuKnowledgeBase')).toBeNull();
    });

    it('should render `Notifications`', async () => {
      (feature.checkVersion as jest.Mock).mockReturnValue(true);

      const {getByTestId} = doRender();

      expect(getByTestId('test:id/menuNotifications')).toBeTruthy();
    });

    it('should not render `Notifications` for the old server', async () => {
      (feature.checkVersion as jest.Mock).mockReturnValue(false);
      doRender();

      expect(screen.queryByTestId('test:id/menuNotifications')).toBeNull();
    });

    it('should not render `Notifications` for the reporter', async () => {
      (feature.checkVersion as jest.Mock).mockReturnValue(true);
      setUserAsReporter();
      doRender();

      expect(screen.queryByTestId('test:id/menuNotifications')).toBeNull();
    });

    it('should render `Settings`', async () => {
      const {getByTestId} = doRender();

      expect(getByTestId('test:id/menuSettings')).toBeTruthy();
    });

    it('should render container if `auth` is not provided', () => {
      stateMock.app.auth = null;
      storeMock = createStoreMock(stateMock);

      const {queryByTestId} = doRender();

      expect(queryByTestId('menu')).toBeTruthy();
    });

    it('should render container if `user` is not provided', () => {
      stateMock.app.user = null;
      storeMock = createStoreMock(stateMock);

      const {queryByTestId} = doRender();

      expect(queryByTestId('menu')).toBeTruthy();
    });

    function setUserAsReporter() {
      stateMock.app.user!.profiles.helpdesk.isReporter = true;
      storeMock = createStoreMock(stateMock);
    }
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
      describe('Not allowed', () => {
        it('should not be allowed because of old server version', () => {
          init({versionMatches: false});
          doRender();

          expect(screen.queryByTestId('test:id/menuTickets')).toBeNull();
        });

        it('should not be allowed because of global settings', () => {
          init({globalEnabled: false});
          doRender();

          expect(screen.queryByTestId('test:id/menuTickets')).toBeNull();
        });

        it('should not be allowed for not reporter without `helpdeskFolder`', () => {
          const currentUser = mocks.createUserMock() as unknown as User;
          currentUser.profiles.helpdesk.helpdeskFolder = undefined;
          init({currentUser});
          doRender();

          expect(screen.queryByTestId('test:id/menuTickets')).toBeNull();
        });

        it('should not be allowed for not reporter if hidden manually from the Settings', () => {
          const currentUser = mocks.createUserMock() as unknown as User;
          init({currentUser, helpdeskMenuHidden: true});
          doRender();

          expect(screen.queryByTestId('test:id/menuTickets')).toBeNull();
        });
      });

      describe('Allowed', () => {
        it('should be allowed for a user with enabled feature and enabled globally on the server', () => {
          init({});
          doRender();

          expect(screen.getByTestId('test:id/menuTickets')).toBeTruthy();
        });

        it('should be enabled for a reporter with globally enabled feature', () => {
          const currentUser = mocks.createUserMock() as unknown as User;
          currentUser.profiles.helpdesk.isReporter = true;
          currentUser.profiles.helpdesk.helpdeskFolder = undefined;
          init({currentUser});
          doRender();

          expect(screen.getByTestId('test:id/menuTickets')).toBeTruthy();
        });
      });


      function init({
        versionMatches = true,
        globalEnabled = true,
        helpdeskMenuHidden = false,
        currentUser = mocks.createUserMock() as unknown as User,
      }: {
        versionMatches?: boolean;
        globalEnabled?: boolean;
        helpdeskMenuHidden?: boolean;
        currentUser?: User;
      }) {
        (feature.checkVersion as jest.Mock).mockReturnValue(versionMatches);
        stateMock.app.globalSettings = {helpdeskEnabled: globalEnabled, type: 'public'};
        stateMock.app.helpdeskMenuHidden = helpdeskMenuHidden;
        stateMock.app.issuePermissions = issuePermissions;
        stateMock.app.user = currentUser;
        storeMock = createStoreMock(stateMock);
      }
    });
  });

  function mockRouter() {
    Router.setNavigator(mocks.navigatorMock as unknown as Navigator);
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
