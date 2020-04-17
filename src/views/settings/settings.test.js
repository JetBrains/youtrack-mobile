import React from 'react';

import Settings from './settings';

import {shallow} from 'enzyme';
import toJson from 'enzyme-to-json';
import mocks from '../../../test/mocks';

let apiMock;
const getApi = () => apiMock;
const createStoreMock = mocks.createMockStore(getApi);


describe('Settings', () => {
  let stateMock;
  let ownPropsMock;
  let storeMock;

  let wrapper;

  beforeEach(() => {
    stateMock = {
      app: {
        otherAccounts: [],
        isChangingAccount: false
      }
    };
    ownPropsMock = {};
    storeMock = createStoreMock(stateMock, ownPropsMock);
  });


  describe('Render', () => {
    beforeEach(() => {
      wrapper = doShallow();
    });

    it('should match a snapshot', () => {
      expect(toJson(wrapper)).toMatchSnapshot();
    });

    it('should render root component', () => {
      expect(findByTestId('settings')).toHaveLength(1);
    });

    it('should render `Accounts` component', () => {
      expect(findByTestId('settingsAccounts')).toHaveLength(1);
    });

    it('should render footer', () => {
      expect(findByTestId('settingsFooter')).toHaveLength(1);
    });
  });


  function findByTestId(testId) {
    return wrapper && wrapper.find({testID: testId});
  }

  function doShallow(props) {
    return shallow(
      <Settings
        store={storeMock}
        {...props}
      />
    ).shallow();
  }
});

