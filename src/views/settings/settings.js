/* @flow */

import React, {PureComponent} from 'react';
import {View, Text, TouchableOpacity, Linking, TouchableWithoutFeedback} from 'react-native';

import {connect} from 'react-redux';

import * as AppActions from '../../actions/app-actions';
import Accounts from '../../components/account/accounts';
import clicksToShowCounter from '../../components/debug-view/clicks-to-show-counter';
import FeaturesView from '../../components/feature/features-view';
import Header from '../../components/header/header';
import Router from '../../components/router/router';
import SettingsAppearance from './settings__appearance';
import SettingsFeedbackForm from './settings__feedback-form';
import usage, {VERSION_STRING} from '../../components/usage/usage';
import {HIT_SLOP} from '../../components/common-styles/button';
import {ThemeContext} from '../../components/theme/theme-context';

import styles from './settings.styles';

import type {StorageState} from '../../components/storage/storage';
import type {Theme, UITheme} from '../../flow/Theme';

type Props = {
  onLogOut: () => any,
  onAddAccount: () => any,
  onChangeAccount: (account: StorageState) => any,
  openDebugView: () => any,

  otherAccounts: Array<StorageState>,
  isChangingAccount: ?boolean,

  features: Array<Object>,
  setFeatures: Function
};

type State = {
  appearanceSettingsVisible: boolean,
  featuresSettingsVisible: boolean,
}

class Settings extends PureComponent<Props, State> {
  CATEGORY_NAME: string = 'Settings';
  state = {
    appearanceSettingsVisible: false,
    featuresSettingsVisible: false,
  };

  constructor(props) {
    super(props);
    usage.trackScreenView(this.CATEGORY_NAME);
  }

  render() {
    const {
      onAddAccount,
      onChangeAccount,
      onLogOut,
      openDebugView,
      setFeatures,
      features,
      otherAccounts,
      isChangingAccount,
    } = this.props;

    return (
      <ThemeContext.Consumer>
        {(theme: Theme) => {
          const uiTheme: UITheme = theme.uiTheme;
          const settingItems: Array<{ title: string, onPress: Function }> = [{
            title: 'Appearance',
            onPress: () => Router.Page({children: <SettingsAppearance/>}),
          }, {
            title: 'Share logs',
            onPress: openDebugView,
          }, {
            title: 'Send feedback',
            onPress: () => Router.PageModal({children: <SettingsFeedbackForm uiTheme={uiTheme}/>}),
          }];

          return (
            <View
              testID="settings"
              style={styles.settings}
            >
              <Header title="Settings"/>

              <View style={styles.settingsContent}>
                {this.state.featuresSettingsVisible &&
                <FeaturesView
                  uiTheme={uiTheme}
                  onHide={() => this.setState({featuresSettingsVisible: false})}
                  features={features}
                  setFeatures={setFeatures}
                />}

                <Accounts
                  onAddAccount={onAddAccount}
                  onChangeAccount={onChangeAccount}
                  onClose={() => {}}
                  onLogOut={onLogOut}
                  openDebugView={openDebugView}
                  otherAccounts={otherAccounts}
                  isChangingAccount={isChangingAccount}
                  uiTheme={uiTheme}
                />

                <View style={styles.settingsList}>
                  {settingItems.map(it => (
                    <View
                      key={it.title}
                      style={styles.settingsListItem}
                    >
                      <TouchableOpacity
                        style={styles.settingsListItemTitle}
                        hitSlop={HIT_SLOP}
                        onPress={it.onPress}>
                        <Text style={styles.settingsListItemTitleText}>{it.title}</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>

                <View
                  testID="settingsFooter"
                  style={styles.settingsFooter}
                >
                  <Text style={styles.settingsFooterTitle}>YouTrack Mobile</Text>

                  <TouchableOpacity
                    onPress={() => Linking.openURL('https://jetbrains.com/youtrack')}>
                    <Text style={styles.settingsFooterLink}>jetbrains.com/youtrack</Text>
                  </TouchableOpacity>

                  <TouchableWithoutFeedback
                    onPress={() => clicksToShowCounter(
                      () => this.setState({featuresSettingsVisible: true}),
                      'open features list'
                    )}
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
    isChangingAccount: state.app.isChangingAccount,
    features: state.app.features,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onLogOut: () => dispatch(AppActions.removeAccountOrLogOut()),
    onAddAccount: () => dispatch(AppActions.addAccount()),
    onChangeAccount: (account: StorageState) => dispatch(AppActions.switchAccount(account)),
    openDebugView: () => dispatch(AppActions.openDebugView()),
    setFeatures: newFeatures => dispatch(AppActions.setEnabledFeatures(newFeatures)),
  };
};

export default (connect(mapStateToProps, mapDispatchToProps)(Settings): any);
