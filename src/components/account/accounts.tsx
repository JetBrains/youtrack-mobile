import {
  View,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Alert,
} from 'react-native';
import React, {PureComponent} from 'react';
import Swiper from 'react-native-swiper';
import Avatar from '../avatar/avatar';
import {IconLogout, IconAdd} from '../icon/icon';
import {formatYouTrackURL} from '../config/config';
import {getStorageState} from '../storage/storage';
import {HIT_SLOP} from '../common-styles/button';
import avatarStyles from '../avatar/default-avatar.styles';
import styles, {SWIPER_HEIGHT} from './accounts.styles';
import type {AppConfig} from 'types/AppConfig';
import type {StorageState} from '../storage/storage';
import type {UITheme} from 'types/Theme';
import type {ViewStyleProp} from 'types/Internal';
type Props = {
  otherAccounts: StorageState[];
  isChangingAccount: boolean | null | undefined;
  onClose: () => any;
  onLogOut: () => any;
  onAddAccount: () => any;
  onChangeAccount: (account: StorageState) => any;
  openDebugView: () => any;
  style?: ViewStyleProp;
  uiTheme: UITheme;
};
export default class Accounts extends PureComponent<Props, void> {
  _logOut = () => {
    const {otherAccounts, onLogOut, onClose} = this.props;
    const hasOtherAccounts = otherAccounts.length > 0;
    Alert.alert(
      hasOtherAccounts ? 'Confirmation required' : 'Confirm logout',
      hasOtherAccounts
        ? 'Do you really want to remove this account?'
        : 'Do you really want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => {
            onLogOut();

            if (!hasOtherAccounts) {
              onClose();
            }
          },
        },
      ],
      {
        cancelable: true,
      },
    );
  };
  _onChangeAccount = (account: StorageState) => {
    if (this.props.isChangingAccount || account === getStorageState()) {
      return;
    }

    this.props.onChangeAccount(account);
  };

  renderAccount(account: StorageState): React.ReactNode {
    const config: AppConfig = account.config;
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
            source={{
              uri: user?.profile?.avatar?.url || '',
            }}
            style={avatarStyles.size80}
          />
        </TouchableWithoutFeedback>

        <Text style={styles.accountProfileName}>{user.name}</Text>

        <Text style={styles.accountProfileServerURL} numberOfLines={1}>
          {formatYouTrackURL(config.backendUrl)}, {config.version}
        </Text>
      </View>
    );
  }

  renderAccounts(): React.ReactElement<React.ComponentProps<any>, any> {
    const {
      openDebugView,
      otherAccounts,
      isChangingAccount,
      uiTheme,
    } = this.props;
    const storageState: StorageState = getStorageState();
    const accounts: StorageState[] = []
      .concat(storageState)
      .concat(otherAccounts || [])
      .filter(account => !!account.config) // Do not render if account is not ready
      .sort((a, b) => (b.creationTimestamp || 0) - (a.creationTimestamp || 0));
    return (
      <Swiper
        height={SWIPER_HEIGHT}
        dotColor={uiTheme.colors.$linkLight}
        activeDotColor={uiTheme.colors.$link}
        loop={false}
        scrollEnabled={!isChangingAccount}
        index={accounts.indexOf(storageState)}
        onIndexChanged={(index: number) =>
          this._onChangeAccount(accounts[index])
        }
        onTouchStart={openDebugView}
        paginationStyle={styles.accountPager}
      >
        {accounts.map((account: StorageState) => this.renderAccount(account))}
      </Swiper>
    );
  }

  render(): React.ReactNode {
    const {onAddAccount, isChangingAccount, uiTheme} = this.props;
    return (
      <View style={styles.accountContainer} testID="accounts">
        <TouchableOpacity
          testID="test:id/accountsAddAccount"
          accessibilityLabel="accountsAddAccount"
          accessible={true}
          hitSlop={HIT_SLOP}
          style={styles.accountAction}
          disabled={isChangingAccount}
          onPress={onAddAccount}
        >
          <IconAdd size={24} color={uiTheme.colors.$link} />
        </TouchableOpacity>

        {this.renderAccounts()}

        <TouchableOpacity
          testID="test:id/accountsOnLogOut"
          accessibilityLabel="accountsOnLogOut"
          accessible={true}
          hitSlop={HIT_SLOP}
          style={[styles.accountAction, styles.accountActionLogOut]}
          disabled={isChangingAccount}
          onPress={this._logOut}
        >
          <IconLogout size={22} color={uiTheme.colors.$link} />
        </TouchableOpacity>
      </View>
    );
  }
}
