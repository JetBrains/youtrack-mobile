/* @flow */

import type {Node} from 'React';
import {View, Text} from 'react-native';
import React, {PureComponent} from 'react';

import {getEntityPresentation, relativeDate} from '../issue-formatter/issue-formatter';

import styles from './user-info.styles';

import type {User} from '../../flow/User';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';
import Avatar from '../avatar/avatar';

type Props = {
  additionalInfo?: string,
  avatar?: React$Element<any>,
  style?: ViewStyleProp,
  timestamp: number,
  user: User
};

export default class UserInfo extends PureComponent<Props, void> {

  render(): Node {
    const {user, style, timestamp, avatar, additionalInfo} = this.props;
    const userName: string = getEntityPresentation(user);

    return (
      <View
        style={[styles.user, style]}
        testID="UserInfo"
      >
        {Boolean(user.avatarUrl) && !avatar && <Avatar
          testID="UserInfoAvatar"
          userName={userName}
          size={32}
          style={styles.userAvatar}
          source={{uri: user.avatarUrl}}
        />}

        {!!avatar && (
          <View style={styles.userAvatar}>
            {avatar}
          </View>
        )}

        {Boolean(userName) && <Text
          style={styles.userName}
          testID="UserInfoName"
        >
          {userName}
          {!!additionalInfo && <Text testID="UserAdditionalInfo">{additionalInfo}</Text>}
        </Text>}

        <View
          testID="UserInfoTimestamp"
          style={styles.timestampContainer}
        >
          <Text style={styles.timestamp}>
            {relativeDate(timestamp)}
          </Text>
        </View>
      </View>
    );
  }
}
