import React from 'react';
import {Provider} from 'react-redux';

import {render, cleanup, fireEvent} from '@testing-library/react-native';

import * as appActions from 'actions/app-actions';
import Menu, {menuPollInboxStatusDelay} from './menu';
import mocks from 'test/mocks';
import Router from 'components/router/router';
import {DEFAULT_THEME} from 'components/theme/theme';
import {rootRoutesList, routeMap} from 'app-routes';

jest.mock('../feature/feature');

let apiMock;
const getApi = () => apiMock;

const createStoreMock = mocks.createMockStore(getApi);
const rootTestID = 'menu';
describe('<Menu/>', () => {
  let storeMock;
  let stateMock;
  let ownPropsMock;
  let router;
  beforeEach(() => {
    jest.restoreAllMocks();
    stateMock = {
      app: {
        auth: {},
        inboxThreadsFolders: [],
        isChangingAccount: false,
        otherAccounts: [],
        user: {},
      },
    };
    ownPropsMock = {};
    storeMock = createStoreMock(stateMock, ownPropsMock);
    router = Router;
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
      const feature = require('../feature/feature');

      feature.checkVersion.mockReturnValue(true);
      const {getByTestId} = doRender();
      expect(getByTestId('test:id/menuKnowledgeBase')).toBeTruthy();
    });
    it('should not render menu `Knowledge Base` item', async () => {
      const feature = require('../feature/feature');

      feature.checkVersion.mockReturnValue(false);
      const {getByTestId} = doRender();
      expect(() => {
        getByTestId('test:id/menuKnowledgeBase');
      }).toThrow();
    });
    it('should render menu `Notifications` item', async () => {
      const feature = require('../feature/feature');

      feature.checkVersion.mockReturnValueOnce(true);
      const {getByTestId} = doRender();
      expect(getByTestId('test:id/menuNotifications')).toBeTruthy();
    });
    it('should not render menu `Notifications` item', async () => {
      const feature = require('../feature/feature');

      feature.checkVersion.mockReturnValue(false);
      const {getByTestId} = doRender();
      expect(() => {
        getByTestId('test:id/menuNotifications');
      }).toThrow();
    });
    it('should render menu `Settings` item', async () => {
      const {getByTestId} = doRender({
        auth: {},
        agileUserProfile: {},
      });
      expect(getByTestId('test:id/menuSettings')).toBeTruthy();
    });
    it('should render menu container if `auth` is not provided', () => {
      stateMock.app.auth = null;
      storeMock = createStoreMock(stateMock, ownPropsMock);
      const {queryByTestId} = doRender();
      expect(queryByTestId('menu')).toBeTruthy();
    });
    it('should render menu container if `user` is not provided', () => {
      stateMock.app.user = null;
      storeMock = createStoreMock(stateMock, ownPropsMock);
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
      storeMock = createStoreMock(stateMock, ownPropsMock);
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
      Router.Issue();
      fireEvent.press(getByTestId('test:id/menuIssues'));
      expect(Router.navigate).toHaveBeenCalledTimes(3);
    });
    it('should activate pressed root route', () => {
      const {getByTestId} = doRender();
      fireEvent.press(getByTestId('test:id/menuIssues'));
      expect(getByTestId('menuIssuesIcon')).toHaveProp('isActive', true);
      fireEvent.press(getByTestId('test:id/menuAgile'));
      expect(getByTestId('menuIssuesIcon')).toHaveProp('isActive', false);
    });
  });
  describe('Inbox status polling', () => {
    beforeAll(() => {
      jest.useFakeTimers({advanceTimers: true});
    });
    afterAll(() => {
      jest.useRealTimers();
    });
    beforeEach(() => {
      mockRouter();
      jest.spyOn(appActions, 'inboxCheckUpdateStatus');
    });
    describe('Inbox threads is available', () => {
      beforeEach(() => {
        const feature = require('../feature/feature');

        feature.checkVersion.mockReturnValue(true);
      });
      it('should start polling without waiting', () => {
        const {getByTestId} = doRender();
        fireEvent.press(getByTestId('test:id/menuIssues'));
        expect(appActions.inboxCheckUpdateStatus).toHaveBeenCalledTimes(1);
      });
      it('should poll status', async () => {
        const {getByTestId} = doRender();
        fireEvent.press(getByTestId('test:id/menuIssues'));
        jest.advanceTimersByTime(menuPollInboxStatusDelay);
        expect(appActions.inboxCheckUpdateStatus).toHaveBeenCalledTimes(2);
      });
      it('should not stop polling status inside inbox threads', async () => {
        const {getByTestId} = doRender();
        fireEvent.press(getByTestId('test:id/menuNotifications'));
        jest.advanceTimersByTime(menuPollInboxStatusDelay);
        expect(appActions.inboxCheckUpdateStatus).toHaveBeenCalled();
      });
    });
    describe('Inbox threads unavailable', () => {
      beforeEach(() => {
        const feature = require('../feature/feature');

        feature.checkVersion.mockReturnValue(false);
      });
      it('should not poll status if the feature is unavailable', () => {
        const {getByTestId} = doRender();
        fireEvent.press(getByTestId('test:id/menuIssues'));
        jest.advanceTimersByTime(menuPollInboxStatusDelay);
        expect(appActions.inboxCheckUpdateStatus).not.toHaveBeenCalled();
      });
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

  function doRender(agileUserProfile = {}) {
    return render(
      <Provider store={storeMock}>
        <Menu
          show={true}
          onOpen={() => {}}
          onClose={() => {}}
          openFeaturesView={() => {}}
          agileProfile={agileUserProfile}
          issueQuery={''}
          uiTheme={DEFAULT_THEME}
        />
      </Provider>,
    );
  }
});
