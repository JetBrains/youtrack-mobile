import React from 'react';

import {shallow} from 'enzyme';
import toJson from 'enzyme-to-json';

import Menu from './menu';
import Router from '../router/router';
import {rootRoutesList} from '../../app-routes';

import Mocks from '../../../test/mocks';


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
        })
        .map(routeName => jest.spyOn(Router, routeName));

    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    describe('openIssueList', () => {
      it('should redirect to Issue list', () => {
        instance.openIssueList();

        expect(Router.IssueList).toHaveBeenCalled();
      });
    });

    describe('openAgileBoard', () => {
      it('should redirect to Agile board', () => {
        instance.openIssueList();

        expect(Router.IssueList).toHaveBeenCalled();
      });
    });

    describe('openInbox', () => {
      it('should redirect to Inbox', () => {
        instance.openInbox();

        expect(Router.Inbox).toHaveBeenCalled();
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
      >{children}</Menu>
    ).shallow();
  }
});
