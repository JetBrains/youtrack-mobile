/* @flow */

import React, {PureComponent} from 'react';
import {View, Text, TouchableOpacity, Linking, Dimensions} from 'react-native';

import {connect} from 'react-redux';

import * as AppActions from '../../actions/app-actions';
import Accounts from '../../components/account/accounts';
import clicksToShowCounter from '../../components/debug-view/clicks-to-show-counter';
import FeaturesDebugSettings from '../../components/feature/features-debug-settings';
import Header from '../../components/header/header';
import ModalPortal from '../../components/modal-view/modal-portal';
import Router from '../../components/router/router';
import SettingsAppearance from './settings__appearance';
import SettingsFeedbackForm from './settings__feedback-form';
import usage, {VERSION_STRING} from 'components/usage/usage';
import {HIT_SLOP} from 'components/common-styles/button';
import {i18n} from 'components/i18n/i18n';
import {IconBack, IconClose} from 'components/icon/icon';
import {isSplitView} from 'components/responsive/responsive-helper';
import {ThemeContext} from 'components/theme/theme-context';

import styles from './settings.styles';

import type {StorageState} from 'components/storage/storage';
import type {Theme, UITheme} from 'flow/Theme';
import type {AppState} from '../../reducers';

type Props = {
  onLogOut: () => any,
  onAddAccount: () => any,
  onChangeAccount: (account: StorageState) => any,
  openDebugView: () => any,

  otherAccounts: Array<StorageState>,
  isChangingAccount: ?boolean,

  features: Array<Object>,
  setFeatures: Function,
};

type State = {
  appearanceSettingsVisible: boolean,
  featuresSettingsVisible: boolean,
  modalChildren: any,
  isSplitView: boolean,
}

class Settings extends PureComponent<Props, State> {
  CATEGORY_NAME: string = 'Settings';
  unsubscribeOnDimensionsChange: Function;

  state = {
    appearanceSettingsVisible: false,
    featuresSettingsVisible: false,
    isSplitView: isSplitView(),
    modalChildren: null,
  };

  constructor(props) {
    super(props);
    usage.trackScreenView(this.CATEGORY_NAME);
    this.toggleModalChildren = this.toggleModalChildren.bind(this);
  }

  onDimensionsChange: () => void = (): void => {
    this.setState({isSplitView: isSplitView()});
  };

  componentDidMount() {
    this.unsubscribeOnDimensionsChange = Dimensions.addEventListener('change', this.onDimensionsChange);
  }

  componentWillUnmount() {
    this.unsubscribeOnDimensionsChange.remove();
  }

  toggleModalChildren = (modalChildren: any = null) => this.setState({modalChildren});

  renderModalPortal() {
    return this.state.isSplitView && (
      <ModalPortal
        onHide={() => this.toggleModalChildren()}
      >
        {this.state.modalChildren}
      </ModalPortal>
    );
  }

  render() {
    const {
      onAddAccount,
      onChangeAccount,
      onLogOut,
      openDebugView,
      otherAccounts,
      isChangingAccount,
    } = this.props;

    return (
      <ThemeContext.Consumer>
        {(theme: Theme) => {
          const uiTheme: UITheme = theme.uiTheme;
          const settingItems: Array<{ title: string, onPress: Function }> = [{
            title: i18n('Appearance'),
            onPress: () => {
              const backIcon: any = (
                isSplitView()
                  ? <IconClose size={21} color={theme.uiTheme.colors.$link}/>
                  : <IconBack color={theme.uiTheme.colors.$link}/>
              );
              if (this.state.isSplitView) {
                this.toggleModalChildren(<SettingsAppearance backIcon={backIcon} onHide={this.toggleModalChildren} />);
              } else {
                Router.Page({
                  children: <SettingsAppearance onHide={() => Router.pop()}/>});
              }},
          }, {
            title: i18n('Share logs'),
            onPress: openDebugView,
          }, {
            title: i18n('Send feedback'),
            onPress: () => Router.PageModal({children: <SettingsFeedbackForm uiTheme={uiTheme}/>}),
          }];

          return (
            <View
              testID="settings"
              style={styles.settings}
            >
              <Header title={i18n('Settings')}/>

              <View style={styles.settingsContent}>
                <Accounts
                  onAddAccount={onAddAccount}
                  onChangeAccount={onChangeAccount}
                  onClose={() => {}}
                  onLogOut={onLogOut}
                  openDebugView={() => clicksToShowCounter(
                    () => Router.PageModal({children: <FeaturesDebugSettings/>})
                  )}
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

                  <Text style={styles.settingsFooterBuild}>{VERSION_STRING}</Text>

                </View>
              </View>
              {this.renderModalPortal()}
            </View>
          );
        }}
      </ThemeContext.Consumer>
    );
  }
}


const mapStateToProps = (state: AppState, ownProps) => {
  return {
    ...ownProps,
    otherAccounts: state.app.otherAccounts,
    isChangingAccount: state.app.isChangingAccount,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onLogOut: () => dispatch(AppActions.removeAccountOrLogOut()),
    onAddAccount: () => dispatch(AppActions.addAccount()),
    onChangeAccount: (account: StorageState) => dispatch(AppActions.switchAccount(account)),
    openDebugView: () => dispatch(AppActions.openDebugView()),
  };
};

export default (connect(mapStateToProps, mapDispatchToProps)(Settings));
