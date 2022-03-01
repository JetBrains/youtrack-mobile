import React from 'react';

import {Provider} from 'react-redux';
import {render, cleanup, fireEvent} from '@testing-library/react-native';

import Menu from './menu';
import mocks from '../../../test/mocks';
import Router from '../router/router';
import {buildStyles, DEFAULT_THEME} from '../theme/theme';
import {rootRoutesList, routeMap} from '../../app-routes';

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

  beforeAll(() => buildStyles(DEFAULT_THEME.mode, DEFAULT_THEME));

  beforeEach(() => {
    jest.restoreAllMocks();

    stateMock = {
      app: {
        otherAccounts: [],
        isChangingAccount: false,
        auth: {},
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

      expect(getByTestId('menuKnowledgeBase')).toBeTruthy();
    });

    it('should not render menu `Knowledge Base` item', async () => {
      const feature = require('../feature/feature');
      feature.checkVersion.mockReturnValue(false);

      const {getByTestId} = doRender();

      expect(() => {
        getByTestId('menuKnowledgeBase');
      }).toThrow();
    });


    it('should render menu `Notifications` item', async () => {
      const feature = require('../feature/feature');
      feature.checkVersion.mockReturnValue(true);

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
      const {getByTestId} = doRender({auth: {}, agileUserProfile: {}});

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
      Router.setNavigator(mocks.navigatorMock);

      rootRoutesList
        .map(routeName => {
          Router.registerRoute({name: routeName, component: null});
          return routeName;
        });
      Router.registerRoute({name: routeMap.Issue, component: null});

      jest.spyOn(router, 'navigate');

    });

    it('should not navigate if `Menu` disabled', () => {
      stateMock.app.isChangingAccount = true;
      storeMock = createStoreMock(stateMock, ownPropsMock);

      const {getByTestId} = doRender();
      fireEvent.press(getByTestId('test:id/menuAgile'));

      expect(Router.navigate).toHaveBeenCalledTimes(0);
    });

    it('should navigate to the root route', async () => {
      const {getByTestId} = doRender();
      fireEvent.press(getByTestId('test:id/menuIssues'));
      fireEvent.press(getByTestId('test:id/menuAgile'));

      expect(Router.navigate).toHaveBeenCalledTimes(2);
    });

    it('should not navigate to the same root route', async () => {
      const {getByTestId} = doRender();

      fireEvent.press(getByTestId('test:id/menuIssues'));
      fireEvent.press(getByTestId('test:id/menuIssues'));

      expect(Router.navigate).toHaveBeenCalledTimes(1);
    });

    it('should navigate to a root route if current route is `Issue`', async () => {
      const {getByTestId} = doRender();

      fireEvent.press(getByTestId('test:id/menuIssues'));
      Router.Issue();
      fireEvent.press(getByTestId('test:id/menuIssues'));

      expect(Router.navigate).toHaveBeenCalledTimes(3);
    });

    it('should activate pressed root route', async () => {
      const {getByTestId} = doRender();

      fireEvent.press(getByTestId('test:id/menuIssues'));
      expect(getByTestId('menuIssuesIcon')).toHaveProp('isActive', true);

      fireEvent.press(getByTestId('test:id/menuAgile'));
      expect(getByTestId('menuIssuesIcon')).toHaveProp('isActive', false);
    });
  });


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
      </Provider>
    );
  }
});
