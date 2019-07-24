/* @flow */

import React, {Component} from 'react';
import {connect} from 'react-redux';

import {
  addAccount,
  changeAccount, closeMenu,
  openDebugView,
  removeAccountOrLogOut
} from '../../actions/app-actions';

import type {StorageState} from '../storage/storage';
import Accounts from '../account/accounts';

type DefaultProps = {
  onClose: () => void
};

type Props = {
  otherAccounts: Array<StorageState>,
  isChangingAccount: ?boolean,

  onClose: () => any,
  onLogOut: () => any,
  onAddAccount: () => any,
  onChangeAccount: (account: StorageState) => any,

  openDebugView: () => any
};


export class ConnectedAccounts extends Component<Props, void> {
  static defaultProps: DefaultProps = {
    onClose: () => {}
  };

  render() {
    const {
      openDebugView,
      isChangingAccount,
      onAddAccount,
      onChangeAccount,
      otherAccounts,
      onLogOut,
      onClose
    } = this.props;

    return (
      <Accounts
        isChangingAccount={isChangingAccount}
        openDebugView={openDebugView}
        otherAccounts={otherAccounts}
        onLogOut={onLogOut}
        onAddAccount={onAddAccount}
        onChangeAccount={onChangeAccount}
        onClose={onClose}
      />
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    otherAccounts: state.app.otherAccounts,
    isChangingAccount: state.app.isChangingAccount,
    ...ownProps
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onClose: () => dispatch(closeMenu()),
    onLogOut: () => dispatch(removeAccountOrLogOut()),
    onAddAccount: () => dispatch(addAccount()),
    onChangeAccount: (account: StorageState) => dispatch(changeAccount(account)),
    openDebugView: () => dispatch(openDebugView()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Accounts);

