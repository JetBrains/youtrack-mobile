/* @flow */
import {View, ScrollView, Text, TouchableWithoutFeedback, TouchableOpacity, Image, Linking, Dimensions, Alert} from 'react-native';
import React, {Component} from 'react';
import styles from './menu.styles';
import {VERSION_STRING} from '../usage/usage';
import {formatYouTrackURL} from '../config/config';
import getTopPadding from '../header/header__top-padding';
import Drawer from 'react-native-drawer';
import Swiper from 'react-native-swiper';
import Router from '../router/router';
import Auth from '../auth/auth';
import {COLOR_DARK_BORDER} from '../variables/variables';
import clicksToShowCounter from '../debug-view/clicks-to-show-counter';
import {next, logOut as logOutIcon, add as addIcon} from '../icon/icon';
import {connect} from 'react-redux';
import {removeAccountOrLogOut, openMenu, closeMenu, openDebugView, addAccount, changeAccount} from '../../actions/app-actions';
import {getStorageState} from '../storage/storage';

import type {StorageState} from '../storage/storage';
import type {AppConfigFilled} from '../../flow/AppConfig';

const CURRENT_YEAR = (new Date()).getFullYear();
const MENU_WIDTH = 280;

function openPrivacyPolicy() {
  Linking.openURL('https://www.jetbrains.com/company/privacy.html');
}


type Props = {
  children?: React$Element<any>,
  show: boolean,
  auth: Auth,
  issueQuery: ?string,
  otherAccounts: Array<StorageState>,
  isChangingAccount: boolean,
  onLogOut: () => any,
  onAddAccount: () => any,
  onChangeAccount: (account: StorageState) => any,
  onOpen: () => any,
  onClose: () => any,
  openDebugView: () => any
};

type DefaultProps = {
  onOpen: () => any,
  onClose: () => any
};

export class Menu extends Component<Props, void> {
  static defaultProps: DefaultProps = {
    onOpen: () => {},
    onClose: () => {}
  };

  _openIssueList = () => {
    this.props.onClose();
    Router.IssueList({auth: this.props.auth});
  }

  _openAgileBoard = () => {
    this.props.onClose();
    Router.AgileBoard({auth: this.props.auth});
  }

  _logOut = () => {
    const hasOtherAccounts = this.props.otherAccounts.length > 0;

    Alert.alert(
      hasOtherAccounts ? 'Confirmation required' : 'Confirm logout',
      hasOtherAccounts ? 'Do you really want to remove this account?' : 'Do you really want to log out?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'OK',
          onPress: () => {
            this.props.onLogOut();
            this.props.onClose();
          }
        }
      ],
      {cancelable: true}
    );
  };

  _onChangeAccount = (account) => {
    if (account === getStorageState()) {
      return;
    }

    this.props.onChangeAccount(account);
  }

  _renderAccounts() {
    const {openDebugView, onAddAccount, otherAccounts, isChangingAccount} = this.props;

    const accounts = [getStorageState(), ...otherAccounts]
      .sort((a, b) => {
        return (b.creationTimestamp || 0) - (a.creationTimestamp || 0);
      });

    return (
      <View>
        <Swiper
          style={styles.swiper}
          dotColor={COLOR_DARK_BORDER}
          activeDotColor="white"
          loop={false}
          height={158}
          scrollEnabled={!isChangingAccount}
          index={accounts.indexOf(getStorageState())}
          onIndexChanged={(index: number) => this._onChangeAccount(accounts[index])}
        >
            {accounts.map((account, index) => {
              const config: AppConfigFilled = account.config;
              const user = account.currentUser;
              if (!user) {
                throw new Error(`Account of ${config.backendUrl} has no currentUser`);
              }
              const avatarUrl = user.profile && user.profile.avatar && user.profile.avatar.url;

              return (
                <View key={index} style={[styles.profileContainer, accounts.length > 1 && styles.profileContainerWithDots]}>
                  <TouchableWithoutFeedback onPress={() => clicksToShowCounter(openDebugView)}>
                    <Image style={styles.currentUserAvatarImage} source={{uri: avatarUrl}}></Image>
                  </TouchableWithoutFeedback>

                  <Text style={styles.serverURL} numberOfLines={1}>{formatYouTrackURL(config.backendUrl)}</Text>
                  <Text style={styles.profileName}>{user.name}</Text>
                </View>
              );
            })}
        </Swiper>

        <TouchableOpacity style={styles.logOutButton} onPress={this._logOut}>
          <Image style={styles.logoutIcon} source={logOutIcon}></Image>
        </TouchableOpacity>

        <TouchableOpacity style={styles.addAccountButton} onPress={onAddAccount}>
          <Image style={styles.addAccountIcon} source={addIcon}></Image>
        </TouchableOpacity>
      </View>
    );
  }

  _renderMenu() {
    const {height} = Dimensions.get('window');
    const {auth, issueQuery} = this.props;
    if (!auth) { //TODO: menu renders right after logOut by some reason.
      return null;
    }

    return (
      <ScrollView style={styles.scrollContainer}>
        <View style={[styles.menuContainer, {paddingTop: getTopPadding(), minHeight: height}]}>
          {this._renderAccounts()}

          <View style={styles.menuItems}>
            <TouchableOpacity activeOpacity={0.4} style={styles.menuItemButton} onPress={this._openIssueList}>
              <View style={styles.menuItemTopLine}>
                <Text style={styles.menuItemText}>Issues</Text>
                <Image style={styles.menuItemIcon} source={next}></Image>
              </View>
              <Text style={styles.menuItemSubtext}>{issueQuery || 'No query'}</Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.4} style={styles.menuItemButton} onPress={this._openAgileBoard}>
              <View style={styles.menuItemTopLine}>
                <Text style={styles.menuItemText}>Agile Boards</Text>
                <Image style={styles.menuItemIcon} source={next}></Image>
              </View>
              <Text style={styles.menuItemSubtext}>Alpha version</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.flexSpacer}/>

          <View style={styles.menuFooter}>
            <Text style={styles.footerText}>YouTrack Mobile {VERSION_STRING}</Text>

            <View style={styles.spacer}></View>
            <Text style={styles.footerText}>© 2000—{CURRENT_YEAR} JetBrains</Text>
            <Text style={styles.footerText}>All rights reserved</Text>

            <View style={styles.spacer}></View>
            <TouchableOpacity style={styles.buttonLink} onPress={openPrivacyPolicy}>
              <Text style={styles.linkText}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  render() {
    const {children, show, onOpen, onClose} = this.props;

    return (
      <Drawer
        type="static"
        open={show}
        content={this._renderMenu()}
        tapToClose={true}
        onOpen={onOpen}
        onClose={onClose}
        openDrawerOffset={viewport => viewport.width - MENU_WIDTH}
        captureGestures={true}
        panOpenMask={12}
      >
        {children}
      </Drawer>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    show: state.app.showMenu,
    auth: state.app.auth,
    otherAccounts: state.app.otherAccounts,
    issueQuery: state.issueList.query,
    isChangingAccount: state.app.isChangingAccount,
    ...ownProps
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onOpen: () => dispatch(openMenu()),
    onClose: () => dispatch(closeMenu()),
    onLogOut: () => dispatch(removeAccountOrLogOut()),
    onAddAccount: () => dispatch(addAccount()),
    onChangeAccount: (account: StorageState) => dispatch(changeAccount(account)),
    openDebugView: () => dispatch(openDebugView()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Menu);

