import React from 'react';

import {shallow} from 'enzyme';
import toJson from 'enzyme-to-json';

import Menu from './menu';
import Router from '../router/router';
import {rootRoutesList, routeMap} from '../../app-routes';

import Mocks from '../../../test/mocks';
import {DEFAULT_THEME} from '../theme/theme';


let apiMock;
const getApi = () => apiMock;
const createStoreMock = Mocks.createMockStore(getApi);
const rootTestID = 'menu';

describe('<Menu/>', () => {

  let wrapper;
  let instance;
  let storeMock;
  let stateMock;
  let ownPropsMock;
  let router;

  beforeEach(() => {
    stateMock = {
      app: {
        otherAccounts: [],
        isChangingAccount: false,
        auth: {},
        user: {},
      }
    };
    ownPropsMock = {};
    storeMock = createStoreMock(stateMock, ownPropsMock);
    router = Router;
  });


  describe('Render', () => {

    it('should match a snapshot', () => {
      render({auth: {}, agileUserProfile: {}});

      expect(toJson(wrapper)).toMatchSnapshot();
    });

    it('should render component', () => {
      render({auth: {}, agileUserProfile: {}});

      expect(findByTestId(rootTestID)).toHaveLength(1);
    });

    it('should not render menu container if `auth` is not provided', () => {
      render({});

      expect(findByTestId(rootTestID)).toHaveLength(1);
    });
  });


  describe('Navigate to views', () => {
    beforeEach(() => {
      renderWithAuth();
      Router.setNavigator(Mocks.navigatorMock);

      rootRoutesList
        .map(routeName => {
          Router.registerRoute({name: routeName, component: null});
          return routeName;
        });

      jest.spyOn(router, 'navigate');

    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should not redirect to the same route', () => {
      instance.setCurrentRouteName(routeMap.Issues, routeMap.Issues);
      instance.openIssueList();

      expect(Router.navigate).not.toHaveBeenCalled();
    });

    it('should redirect to Issues route if user was on issue screen', () => {
      instance.setCurrentRouteName(routeMap.Issue, routeMap.Issue);
      instance.openIssueList();

      expect(Router.navigate).toHaveBeenCalled();
    });

    it('should redirect to Agile route if user was on issue screen', () => {
      instance.setCurrentRouteName(routeMap.AgileBoard, routeMap.Issue);
      instance.openIssueList();

      expect(Router.navigate).toHaveBeenCalled();
    });

    it('should redirect to Notifications route if user was on issue screen', () => {
      instance.setCurrentRouteName(routeMap.Inbox, routeMap.Issue);
      instance.openIssueList();

      expect(Router.navigate).toHaveBeenCalled();
    });

    describe('openIssueList', () => {

      it('should redirect to Issue list', () => {
        instance.setCurrentRouteName(routeMap.AgileBoard);
        instance.openIssueList();

        expect(Router.navigate).toHaveBeenCalledWith(routeMap.Issues);
      });
    });

    describe('openAgileBoard', () => {
      it('should redirect to Agile board', () => {
        instance.openAgileBoard();

        expect(Router.navigate).toHaveBeenCalledWith(routeMap.AgileBoard);
      });
    });

    describe('openInbox', () => {
      it('should redirect to Inbox', () => {
        instance.openInbox();

        expect(Router.navigate).toHaveBeenCalledWith(routeMap.Inbox);
      });
    });
  });


  function render({auth, agileUserProfile, children}) {
    wrapper = doShallow(auth, agileUserProfile, children);
    instance = wrapper.instance();
  }

  function renderWithAuth(agileUserProfile) {
    return render({auth: {}, agileUserProfile});
  }

  function findByTestId(testId) {
    return wrapper && wrapper.find({testID: testId});
  }

  function doShallow(auth, agileUserProfile, children) {
    return shallow(
      <Menu
        store={storeMock}
        auth={auth}
        show={true}
        onOpen={() => {}}
        onClose={() => {}}
        openFeaturesView={() => {}}
        agileProfile={agileUserProfile}
        issueQuery={''}
        uiTheme={DEFAULT_THEME}
      >{children}</Menu>
    ).shallow();
  }
});
