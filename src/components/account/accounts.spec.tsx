import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';

import * as storage from 'components/storage/storage';
import Accounts from './accounts';
import {DEFAULT_THEME} from 'components/theme/theme';
import {StorageState} from 'components/storage/storage';

let instance: Accounts;
let onAddAccountMock: jest.Mock;
let onChangeAccountMock: jest.Mock;
let onLogOutMock: jest.Mock;
let accountsMock: StorageState[];
let timestamp: number;

describe('<Accounts/>', () => {
  beforeEach(() => {
    timestamp = -1;
    onAddAccountMock = jest.fn();
    onChangeAccountMock = jest.fn();
    onLogOutMock = jest.fn();
    storage.flushStorage(createAccountMock('http://server.org'));
    accountsMock = [createAccountMock(), createAccountMock()];
  });

  const testIdWrapper = 'accounts';
  const testIdAccountElement = 'test:id/accountsAccount';
  const testIdAddAccountButton = 'test:id/accountsAddAccount';

  describe('Account', () => {
    it('should add new account', () => {
      const {getByTestId} = doRender({isChangingAccount: false});
      const addAccountButton = getByTestId(testIdAddAccountButton);
      fireEvent.press(addAccountButton);

      expect(onAddAccountMock).toHaveBeenCalled();
    });
  });

  describe('_onChangeAccount', () => {
    beforeEach(() => {
      jest.spyOn(storage, 'getStorageState').mockReturnValue(accountsMock[0]);
      storage.flushStorage(accountsMock[0]);
    });

    it('should not change an account if is already changing an account', () => {
      createInstance({isChangingAccount: true, otherAccounts: accountsMock} );
      instance._onChangeAccount(accountsMock[1]);

      expect(onChangeAccountMock).not.toHaveBeenCalled();
    });

    it('should not change a current account to the same one', () => {
      createInstance({otherAccounts: accountsMock} );
      instance._onChangeAccount(accountsMock[0]);

      expect(onChangeAccountMock).not.toHaveBeenCalled();
    });

    it('should change an account', () => {
      createInstance({otherAccounts: accountsMock} );
      instance._onChangeAccount(accountsMock[1]);

      expect(onChangeAccountMock).toHaveBeenCalled();
    });
  });

  describe('Render', () => {
    it('should render component', () => {
      const {getByTestId} = doRender({otherAccounts: accountsMock});
      expect(getByTestId(testIdWrapper)).toBeTruthy();
    });

    it('should render all accounts', () => {
      const {getAllByTestId} = doRender({otherAccounts: accountsMock});

      expect(getAllByTestId(testIdAccountElement)).toHaveLength(3);
    });

    it('should not render accounts without `config`', () => {
      const {getAllByTestId} = doRender({otherAccounts: [{} as StorageState, createAccountMock()]});

      expect(getAllByTestId(testIdAccountElement)).toHaveLength(2);
    });

    it('should render latest accounts first', () => {
      const {getAllByTestId} = doRender({otherAccounts: accountsMock});
      const elements = getAllByTestId(testIdAccountElement);
      const firstElProps = elements[0].props;
      const secondElProps = elements[1].props;

      expect(getCreationTimestampFrom(firstElProps)).toEqual(accountsMock[1].creationTimestamp);
      expect(getCreationTimestampFrom(secondElProps)).toEqual(accountsMock[0].creationTimestamp);

      function getCreationTimestampFrom(elElement: Record<string, any>) {
        return Number(elElement.testKey.split('_').pop());
      }
    });
  });

  function createAccountMock(backendUrl = 'https://youtrack.com') {
    return {
      creationTimestamp: ++timestamp,
      config: {
        backendUrl: backendUrl,
      },
      currentUser: {
        id: 'user',
      },
    } as StorageState;
  }

  function createInstance({isChangingAccount = false, otherAccounts = []}: {
    isChangingAccount?: boolean,
    otherAccounts?: StorageState[]
  }) {
    instance = new Accounts({
      otherAccounts,
      isChangingAccount,
      onClose: () => {},
      onLogOut: onLogOutMock,
      onAddAccount: onAddAccountMock,
      onChangeAccount: onChangeAccountMock,
      openDebugView: () => {},
      uiTheme: DEFAULT_THEME,
    });
  }

  function doRender({
    isChangingAccount = false,
    openDebugView = () => {},
    otherAccounts = [] as StorageState[],
    onAddAccount = onAddAccountMock,
    onChangeAccount = onChangeAccountMock,
    onLogOut = onLogOutMock,
  } = {}) {
    return render(
      <Accounts
        isChangingAccount={isChangingAccount}
        openDebugView={openDebugView}
        otherAccounts={otherAccounts}
        onAddAccount={onAddAccount}
        onChangeAccount={onChangeAccount}
        onLogOut={onLogOut}
        uiTheme={DEFAULT_THEME}
        onClose={() => {}}
      />
    );
  }
});
