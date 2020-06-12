/* @flow */

import {View, Text, TouchableWithoutFeedback, TouchableOpacity, Alert} from 'react-native';
import React, {PureComponent} from 'react';

import type {StorageState} from '../storage/storage';
import type {AppConfigFilled} from '../../flow/AppConfig';

import {COLOR_PINK, COLOR_PINK_TRANSPARENT} from '../variables/variables';

import Swiper from 'react-native-swiper';
import Avatar from '../avatar/avatar';
import {IconLogout, IconAdd} from '../icon/icon';
import {formatYouTrackURL} from '../config/config';
import clicksToShowCounter from '../debug-view/clicks-to-show-counter';
import {getStorageState} from '../storage/storage';
import {HIT_SLOP} from '../common-styles/button';

import avatarStyles from '../avatar/default-avatar.styles';
import styles, {SWIPER_HEIGHT} from './accounts.styles';

import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

type Props = {
  otherAccounts: Array<StorageState>,
  isChangingAccount: ?boolean,

  onClose: () => any,
  onLogOut: () => any,
  onAddAccount: () => any,
  onChangeAccount: (account: StorageState) => any,

  openDebugView: () => any,
  style?: ViewStyleProp
};

export default class Accounts extends PureComponent<Props, void> {

  _logOut = () => {
    const {otherAccounts, onLogOut, onClose} = this.props;
    const hasOtherAccounts = otherAccounts.length > 0;

    Alert.alert(
      hasOtherAccounts ? 'Confirmation required' : 'Confirm logout',
      hasOtherAccounts ? 'Do you really want to remove this account?' : 'Do you really want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Yes',
          onPress: () => {
            onLogOut();
            if (!hasOtherAccounts) {
              onClose();
            }
          }
        }
      ],
      {cancelable: true}
    );
  };

  _onChangeAccount = (account: StorageState) => {
    if (this.props.isChangingAccount || account === getStorageState()) {
      return;
    }

    this.props.onChangeAccount(account);
  };

  renderAccount(account: StorageState) {
    const config: AppConfigFilled = account.config;
    const user = account.currentUser;

    if (!user) {
      throw new Error(`Account of ${config.backendUrl} has no currentUser`);
    }

    return (
      <View
        testID="accountsAccount"
        key={`${config?.backendUrl}_${account.creationTimestamp || ''}`}
        style={[styles.accountProfile, this.props.style]}
      >
        <TouchableWithoutFeedback>
          <Avatar
            size={80}
            userName={user.name}
            source={{uri: user?.profile?.avatar?.url || ''}}
            style={avatarStyles.size80}
          />
        </TouchableWithoutFeedback>

        <Text style={styles.accountProfileName}>{user.name}</Text>

        <Text style={styles.accountProfileServerURL} numberOfLines={1}>{formatYouTrackURL(config.backendUrl)}</Text>
      </View>
    );
  }

  render() {
    const {openDebugView, onAddAccount, otherAccounts, isChangingAccount} = this.props;
    const storageState = getStorageState();
    const accounts: Array<StorageState> = [].concat(storageState).concat(otherAccounts || [])
      .filter(account => !!account.config) // Do not render if account is not ready
      .sort((a, b) => (b.creationTimestamp || 0) - (a.creationTimestamp || 0));

    return (
      <View
        style={styles.accountContainer}
        testID="accounts"
      >

        <TouchableOpacity
          testID="accountsAddAccount"
          hitSlop={HIT_SLOP}
          style={styles.accountAction}
          disabled={isChangingAccount}
          onPress={onAddAccount}>
          <IconAdd size={24} color={COLOR_PINK}/>
        </TouchableOpacity>

        <Swiper
          height={SWIPER_HEIGHT}
          dotColor={COLOR_PINK_TRANSPARENT}
          activeDotColor={COLOR_PINK}
          loop={false}
          scrollEnabled={!isChangingAccount}
          index={accounts.indexOf(storageState)}
          onIndexChanged={(index: number) => this._onChangeAccount(accounts[index])}
          onTouchStart={() => clicksToShowCounter(openDebugView, 'open debug view')}
        >
          {accounts.map((account:StorageState) => this.renderAccount(account))}
        </Swiper>

        <TouchableOpacity
          testID="accountsOnLogOut"
          hitSlop={HIT_SLOP}
          style={[styles.accountAction, styles.accountActionLogOut]}
          disabled={isChangingAccount}
          onPress={this._logOut}>
          <IconLogout size={22} color={COLOR_PINK}/>
        </TouchableOpacity>

      </View>
    );
  }
}


