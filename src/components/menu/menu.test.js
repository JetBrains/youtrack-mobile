import React from 'react';

import {Provider} from 'react-redux';
import {render, cleanup, fireEvent} from '@testing-library/react-native';

import * as api from '../api/api__instance';
import Menu from './menu';
import mocks from '../../../test/mocks';
import Router from '../router/router';
import {buildStyles, DEFAULT_THEME} from '../theme/theme';
import {rootRoutesList, routeMap} from '../../app-routes';


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

      expect(getByTestId('menuIssues')).toBeTruthy();
    });

    it('should render menu `Agile Boards` item', async () => {
      const {getByTestId} = doRender();

      expect(getByTestId('menuAgileBoards')).toBeTruthy();
    });


    xdescribe('Knowledge Base', () => {
      beforeEach(() => jest.spyOn(api, 'getApi'));

      it('should render menu `Knowledge Base` item', async () => {
        api.getApi.mockReturnValueOnce({
          config: {
            version: '2020.2',
          },
        });
        const {getByTestId} = doRender();

        expect(getByTestId('menuKnowledgeBase')).toBeTruthy();
      });
    });


    describe('Notifications', () => {
      beforeEach(() => jest.spyOn(api, 'getApi'));

      it('should render menu `Notifications` item', async () => {
        api.getApi.mockReturnValueOnce({
          config: {
            version: '2018.4',
          },
        });
        const {getByTestId} = doRender();

        expect(getByTestId('menuNotifications')).toBeTruthy();
      });

      it('should not render menu `Notifications` item', async () => {
        api.getApi.mockReturnValueOnce({
          config: {
            version: '2018.2',
          },
        });
        const {queryByTestId} = doRender();

        expect(queryByTestId('menuNotifications')).toBeNull();
      });
    });


    it('should render menu `Settings` item', async () => {
      const {getByTestId} = doRender({auth: {}, agileUserProfile: {}});

      expect(getByTestId('menuSettings')).toBeTruthy();
    });

    it('should not render menu container if `auth` is not provided', () => {
      stateMock.app.auth = null;
      storeMock = createStoreMock(stateMock, ownPropsMock);
      const {queryByTestId} = doRender();

      expect(queryByTestId('menu')).toBeNull();
    });

    it('should not render menu container if `user` is not provided', () => {
      stateMock.app.user = null;
      storeMock = createStoreMock(stateMock, ownPropsMock);
      const {queryByTestId} = doRender();

      expect(queryByTestId('menu')).toBeNull();
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
      fireEvent.press(getByTestId('menuAgileBoardsButton'));

      expect(Router.navigate).toHaveBeenCalledTimes(0);
    });

    it('should navigate to the root route', async () => {
      const {getByTestId} = doRender();
      fireEvent.press(getByTestId('menuIssuesButton'));
      fireEvent.press(getByTestId('menuAgileBoardsButton'));

      expect(Router.navigate).toHaveBeenCalledTimes(2);
    });

    it('should not navigate to the same root route', async () => {
      const {getByTestId} = doRender();

      fireEvent.press(getByTestId('menuIssuesButton'));
      fireEvent.press(getByTestId('menuIssuesButton'));

      expect(Router.navigate).toHaveBeenCalledTimes(1);
    });

    it('should navigate to a root route if current route is `Issue`', async () => {
      const {getByTestId} = doRender();

      fireEvent.press(getByTestId('menuIssuesButton'));
      Router.Issue();
      fireEvent.press(getByTestId('menuIssuesButton'));

      expect(Router.navigate).toHaveBeenCalledTimes(3);
    });

    it('should activate pressed root route', async () => {
      const {getByTestId} = doRender();

      fireEvent.press(getByTestId('menuIssuesButton'));
      expect(getByTestId('menuIssuesIcon')).toHaveProp('isActive', true);

      fireEvent.press(getByTestId('menuAgileBoardsButton'));
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
