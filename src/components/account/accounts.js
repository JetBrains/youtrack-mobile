/* @flow */

import {View, Text, TouchableWithoutFeedback, TouchableOpacity, Image, Alert} from 'react-native';
import React, {PureComponent} from 'react';

import type {StorageState} from '../storage/storage';
import type {AppConfigFilled} from '../../flow/AppConfig';

import {COLOR_DARK_BORDER} from '../variables/variables';

import Swiper from 'react-native-swiper';
import Avatar from '../avatar/avatar';
import {logOut as logOutIcon, add as addIcon} from '../icon/icon';
import {formatYouTrackURL} from '../config/config';
import clicksToShowCounter from '../debug-view/clicks-to-show-counter';
import {getStorageState} from '../storage/storage';

import styles from './accounts.styles';


type Props = {
  otherAccounts: Array<StorageState>,
  isChangingAccount: ?boolean,

  onClose: () => any,
  onLogOut: () => any,
  onAddAccount: () => any,
  onChangeAccount: (account: StorageState) => any,

  openDebugView: () => any
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


  render() {
    const {openDebugView, onAddAccount, otherAccounts, isChangingAccount} = this.props;
    const storageState = getStorageState();
    const accounts: Array<StorageState> = [].concat(storageState).concat(otherAccounts || [])
      .filter(account => !!account.config) // Do not render if account is not ready
      .sort((a, b) => (b.creationTimestamp || 0) - (a.creationTimestamp || 0));

    return (
      <View
        style={styles.accountContainer}
        testID="accounts">
        <TouchableOpacity
          testID="accountsAddAccount"
          style={styles.action}
          disabled={isChangingAccount}
          onPress={onAddAccount}>
          <Image style={styles.actionIcon} source={addIcon}/>
        </TouchableOpacity>

        <Swiper
          dotColor={COLOR_DARK_BORDER}
          activeDotColor="white"
          loop={false}
          height={158}
          scrollEnabled={!isChangingAccount}
          index={accounts.indexOf(storageState)}
          onIndexChanged={(index: number) => this._onChangeAccount(accounts[index])}
          onTouchStart={() => clicksToShowCounter(openDebugView, 'open debug view')}
        >
          {accounts.map((account, index) => {
            const config: AppConfigFilled = account.config;
            const user = account.currentUser;
            if (!user) {
              throw new Error(`Account of ${config.backendUrl} has no currentUser`);
            }
            const avatarUrl = user.profile && user.profile.avatar && user.profile.avatar.url || '';

            return (
              <View
                testID="accountsAccount"
                key={`${index}_${account.creationTimestamp || 0}`}
                style={[styles.profileContainer, accounts.length > 1 && styles.profileContainerMultipleAccount]}>
                <TouchableWithoutFeedback>
                  <Avatar size={64} userName={user.name} source={{uri: avatarUrl}}/>
                </TouchableWithoutFeedback>

                <Text style={styles.serverURL} numberOfLines={1}>{formatYouTrackURL(config.backendUrl)}</Text>
                <Text style={styles.profileName}>{user.name}</Text>
              </View>
            );
          })}
        </Swiper>

        <TouchableOpacity
          testID="accountsOnLogOut"
          style={styles.action}
          disabled={isChangingAccount}
          onPress={this._logOut}>
          <Image style={styles.actionIcon} source={logOutIcon}/>
        </TouchableOpacity>

      </View>
    );
  }
}


