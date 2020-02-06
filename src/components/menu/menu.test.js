import React from 'react';
import {Text} from 'react-native';

import {shallow} from 'enzyme';
import toJson from 'enzyme-to-json';

import {Menu} from './menu';
import Router from '../router/router';


describe('<Menu/>', () => {

  const rootTestID = 'menuDrawer';
  const containerTestID = 'menuContainer';
  let wrapper;
  let instance;

  describe('Render', () => {

    it('should match a snapshot', () => {
      render({auth: {}, agileUserProfile: {}});

      expect(toJson(wrapper)).toMatchSnapshot();
    });

    it('should render component', () => {
      render({auth: {}, agileUserProfile: {}});

      expect(findByTestId(rootTestID)).toHaveLength(1);
      expect(findChildByTestId(rootTestID, containerTestID)).toHaveLength(1);
    });

    it('should not render menu container if `auth` is not provided', () => {
      render({});

      expect(findByTestId(rootTestID)).toHaveLength(1);
      expect(findChildByTestId(rootTestID, containerTestID)).toHaveLength(0);
    });

    it('should render menu children', () => {
      const menuChildrenTestId = 'menuChildren';
      render({auth: {}, children: <Text testID={menuChildrenTestId}>node</Text>});

      expect(findByTestId(rootTestID)).toHaveLength(1);
      expect(findChildByTestId(rootTestID, menuChildrenTestId)).toHaveLength(1);
    });
  });


  describe('_getSelectedAgileBoard', () => {
    const idMock = 'id';
    const agileNameMock = 'agileName';
    const lastVisitedSprintNameMock = 'sprintName';

    it('should return empty string if an `agileProfile` is not provided', () => {
      render({auth: {}});

      expect(instance._getSelectedAgileBoard()).toEqual('');
    });

    it('should return empty string if there is no `defaultAgile` filed in an `agileProfile`', () => {
      renderWithAuth({});

      expect(instance._getSelectedAgileBoard()).toEqual('');
    });

    it('should return empty string if a `defaultAgile` filed has no name', () => {
      renderWithAuth({
        defaultAgile: {}
      });

      expect(instance._getSelectedAgileBoard()).toEqual('');
    });

    it('should return empty string if a `defaultAgile` is empty but `visitedSprints` is not empty', () => {
      renderWithAuth({
        defaultAgile: {},
        visitedSprints: [
          {agile: {id: 'id'}}
        ]
      });

      expect(instance._getSelectedAgileBoard()).toEqual('');
    });

    it('should return agile name', () => {
      renderWithAuth({
        defaultAgile: {name: agileNameMock},
        visitedSprints: []
      });

      expect(instance._getSelectedAgileBoard()).toEqual(agileNameMock);
    });

    it('should return agile and last visited sprint', () => {

      renderWithAuth({
        defaultAgile: {name: agileNameMock, id: idMock},
        visitedSprints: [{
          name: lastVisitedSprintNameMock,
          agile: {id: idMock}
        }]
      });

      expect(instance._getSelectedAgileBoard()).toEqual(`${agileNameMock}, ${lastVisitedSprintNameMock}`);
    });

  });


  describe('', () => {
    let _methods;

    beforeEach(() => {
      renderWithAuth();
      _methods = [Router.IssueList, Router.AgileBoard];
      Router.IssueList = jest.fn();
      Router.AgileBoard = jest.fn();

      wrapper.setProps({
        onClose: jest.fn()
      });
    });

    afterEach(() => {
      Router.IssueList = _methods[0];
      Router.AgileBoard = _methods[1];
    });

    describe('_openIssueList', () => {
      it('should close menu', () => {
        instance._openIssueList();

        expect(wrapper.props().onClose).toHaveBeenCalled();
      });

      it('should redirect to Issue list', () => {
        instance._openIssueList();

        expect(Router.IssueList).toHaveBeenCalled();
      });
    });

    describe('_openAgileBoard', () => {
      it('should close menu', () => {
        instance._openAgileBoard();

        expect(wrapper.props().onClose).toHaveBeenCalled();
      });

      it('should redirect to Agile board', () => {
        instance._openIssueList();

        expect(Router.IssueList).toHaveBeenCalled();
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

  function findChildByTestId(parentTestId, targetTestId) {
    const parentShallowWrapper = findByTestId(parentTestId);
    if (parentShallowWrapper) {
      return parentShallowWrapper.dive().find({testID: targetTestId});
    }
  }

  function doShallow(auth, agileUserProfile, children) {
    return shallow(
      <Menu
        auth={auth}
        show={true}
        onOpen={() => {}}
        onClose={() => {}}
        openFeaturesView={() => {}}
        agileProfile={agileUserProfile}
        issueQuery={''}
      >{children}</Menu>
    );
  }
});
