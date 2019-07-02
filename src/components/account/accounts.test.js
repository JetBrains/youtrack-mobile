import React from 'react';
import {shallow} from 'enzyme';
import toJson from 'enzyme-to-json';

import * as storage from '../storage/storage';
import Accounts from './accounts';

describe('<Accounts/>', () => {
  createAccountMock.id = null;

  let wrapper;
  let instance;
  let onAddAccountMock;
  let onChangeAccountMock;
  let onLogOutMock;
  let accountsMock;

  beforeEach(() => {
    onAddAccountMock = jest.fn();
    onChangeAccountMock = jest.fn();
    onLogOutMock = jest.fn();

    storage.flushStorage(
      createAccountMock('http://server.org')
    );
    accountsMock = [
      createAccountMock(),
      createAccountMock()
    ];
  });


  const testIdWrapper = 'accounts';
  const testIdAccountElement = 'accountsAccount';
  const testIdAddAccountButton = 'accountsAddAccount';

  describe('Account', () => {
    beforeEach(() => {
      wrapper = doShallow({isChangingAccount: false});
    });

    it('should add new account', () => {
      const addAccountButton = findByTestId(testIdAddAccountButton);
      addAccountButton.simulate('press');

      expect(onAddAccountMock).toHaveBeenCalled();
    });
  });


  describe('_onChangeAccount', () => {
    beforeEach(() => {
      wrapper = doShallow({otherAccounts: accountsMock});
      instance = wrapper.instance();

      storage.getStorageState = jest.fn(() => accountsMock[0]);
      storage.flushStorage(accountsMock[0]);
    });

    it('should not change an account if is already changing an account', () => {
      wrapper.setProps({isChangingAccount: true});

      instance._onChangeAccount(accountsMock[1]);

      expect(onChangeAccountMock).not.toBeCalled();
    });

    it('should not change a current account to the same one', () => {
      instance._onChangeAccount(accountsMock[0]);

      expect(onChangeAccountMock).not.toBeCalled();
    });

    it('should change an account', () => {
      instance._onChangeAccount(accountsMock[1]);

      expect(onChangeAccountMock).toBeCalled();
    });

  });


  describe('Render', () => {
    beforeEach(() => {
      wrapper = doShallow({otherAccounts: accountsMock});
    });

    it('should match a snapshot', () => {
      expect(toJson(wrapper)).toMatchSnapshot();
    });

    it('should render component', () => {
      expect(findByTestId(testIdWrapper)).toHaveLength(1);
    });

    it('should render all accounts', () => {
      expect(findByTestId(testIdAccountElement)).toHaveLength(3);
    });

    it('should not render accounts without `config`', () => {
      wrapper.setProps({otherAccounts: [{}, createAccountMock()]});

      expect(findByTestId(testIdAccountElement)).toHaveLength(2);
    });

    it('should render latest accounts first', () => {
      const re = findByTestId(testIdAccountElement);
      expect(getCreationTimestampFrom(re, 0)).toBe(accountsMock[1].creationTimestamp);
      expect(getCreationTimestampFrom(re, 1)).toBe(accountsMock[0].creationTimestamp);

      function getCreationTimestampFrom(re, index) {
        return Number(re.get(index).key.split('_').pop());
      }
    });
  });


  function createAccountMock(backendUrl = 'https://youtrack.com') {
    if (!createAccountMock.id) {
      createAccountMock.id = 0;
    }
    return {
      creationTimestamp: ++createAccountMock.id,
      config: {
        backendUrl: backendUrl
      },
      currentUser: {
        id: 'user'
      }
    };
  }

  function findByTestId(testId) {
    return wrapper && wrapper.find({testID: testId});
  }

  function doShallow(
    {
      isChangingAccount = false,
      openDebugView = false,
      otherAccounts = [],
      onAddAccount = onAddAccountMock,
      onChangeAccount = onChangeAccountMock,
      onLogOut = onLogOutMock
    } = {}
  ) {
    return shallow(
      <Accounts
        isChangingAccount={isChangingAccount}
        openDebugView={openDebugView}
        otherAccounts={otherAccounts}
        onAddAccount={onAddAccount}
        onChangeAccount={onChangeAccount}
        onLogOut={onLogOut}
      />
    );
  }
});
