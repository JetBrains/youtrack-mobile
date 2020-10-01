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
import {getSystemThemeMode, themes} from '../../components/theme/theme';

import {IconCheck} from '../../components/icon/icon';
import {getStorageState} from '../../components/storage/storage';

import {HIT_SLOP} from '../../components/common-styles/button';
import styles from './settings.styles';

import type {StorageState} from '../../components/storage/storage';
import type {Theme, UITheme} from '../../flow/Theme';

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

  getUserThemeMode(): string {
    return getStorageState().themeMode || '';
  }

  renderThemeCheckbox(currentTheme: Theme, uiTheme: Object): any {
    const userThemeMode: ?string = this.getUserThemeMode();
    const mode: string = uiTheme.mode;
    const isChecked = (!userThemeMode && uiTheme.system) || (!uiTheme.system && !!userThemeMode && userThemeMode.indexOf(mode) !== -1);

    return (
      <TouchableOpacity
        key={mode}
        hitSlop={HIT_SLOP}
        onPress={async () => {
          currentTheme.setMode(uiTheme.mode, !!uiTheme.system);
        }}
      >
        <View style={styles.settingsItem}>
          <Text style={styles.settingsItemText}>
            {`${uiTheme.name} theme`}
            {uiTheme.system && <Text style={styles.settingsItemTextSecondary}>{` (${uiTheme.mode})`}</Text>}
          </Text>
          {isChecked && <IconCheck size={20} color={currentTheme.uiTheme.colors.$link}/>}
        </View>
      </TouchableOpacity>
    );
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
          const systemTheme: Object = Object.assign(
            {},
            {name: 'System', mode: getSystemThemeMode(), system: true}
          );
          const uiTheme: UITheme = theme.uiTheme;

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
                  uiTheme={uiTheme}
                />

                <View style={styles.settingsOther}>
                  {themes.concat(systemTheme).map((it: Object) => this.renderThemeCheckbox(theme, it))}

                  <TouchableOpacity
                    style={styles.settingsTitle}
                    hitSlop={HIT_SLOP}
                    onPress={openDebugView}>
                    <Text style={styles.settingsFooterLink}>Share logs</Text>
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
