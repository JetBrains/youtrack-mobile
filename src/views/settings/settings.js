/* @flow */

import React, {Component} from 'react';
import {connect} from 'react-redux';
import {View, Text, TouchableOpacity, Linking, TouchableWithoutFeedback} from 'react-native';

import Accounts from '../../components/account/accounts';
import clicksToShowCounter from '../../components/debug-view/clicks-to-show-counter';
import Header from '../../components/header/header';
import usage, {VERSION_STRING} from '../../components/usage/usage';
import * as AppActions from '../../actions/app-actions';
import {AppVersion} from '../../util/util';

import {ThemeContext} from '../../components/theme/theme-context';

import {HIT_SLOP} from '../../components/common-styles/button';
import styles from './settings.styles';

import type {StorageState} from '../../components/storage/storage';
import type {Theme} from '../../flow/Theme';

type Props = {
  onLogOut: () => any,
  onAddAccount: () => any,
  onChangeAccount: (account: StorageState) => any,
  openDebugView: () => any,
  openFeaturesView: () => any,

  otherAccounts: Array<StorageState>,
  isChangingAccount: ?boolean
};

const CATEGORY_NAME = 'Settings';


class Settings extends Component<Props, void> {

  constructor(props) {
    super(props);
    usage.trackScreenView(CATEGORY_NAME);
  }

  render() {
    const {
      onAddAccount,
      onChangeAccount,
      onLogOut,
      openDebugView,
      openFeaturesView,

      otherAccounts,
      isChangingAccount
    } = this.props;

    return (
      <ThemeContext.Consumer>
        {(theme: Theme) => {
          return (
            <View
              testID="settings"
              style={styles.settings}
            >
              <Header title="Settings"/>

              <View style={styles.settingsContent}>
                <Accounts
                  testID="settingsAccounts"
                  onAddAccount={onAddAccount}
                  onChangeAccount={onChangeAccount}
                  onClose={() => {}}
                  onLogOut={onLogOut}
                  openDebugView={openDebugView}
                  otherAccounts={otherAccounts}
                  isChangingAccount={isChangingAccount}
                  uiTheme={theme.uiTheme}
                />

                <View style={styles.settingsOther}>

                  <TouchableOpacity
                    hitSlop={HIT_SLOP}
                    onPress={openDebugView}>
                    <Text style={styles.settingsFooterLink}>Show logs</Text>
                  </TouchableOpacity>
                </View>

                <View
                  testID="settingsFooter"
                  style={styles.settingsFooter}
                >
                  <Text style={styles.settingsFooterTitle}>YouTrack Mobile {AppVersion}</Text>

                  <TouchableOpacity
                    onPress={() => Linking.openURL('https://jetbrains.com/youtrack')}>
                    <Text style={styles.settingsFooterLink}>jetbrains.com/youtrack</Text>
                  </TouchableOpacity>

                  <TouchableWithoutFeedback
                    onPress={() => clicksToShowCounter(openFeaturesView, 'open features list')}
                  >
                    <Text style={styles.settingsFooterBuild}>{VERSION_STRING}</Text>
                  </TouchableWithoutFeedback>

                </View>
              </View>


            </View>
          );
        }}
      </ThemeContext.Consumer>
    );
  }
}


const mapStateToProps = (state, ownProps) => {
  return {
    ...ownProps,
    otherAccounts: state.app.otherAccounts,
    isChangingAccount: state.app.isChangingAccount
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onLogOut: () => dispatch(AppActions.removeAccountOrLogOut()),
    onAddAccount: () => dispatch(AppActions.addAccount()),
    onChangeAccount: (account: StorageState) => dispatch(AppActions.switchAccount(account)),
    openDebugView: () => dispatch(AppActions.openDebugView()),
    openFeaturesView: () => dispatch(AppActions.openFeaturesView()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
