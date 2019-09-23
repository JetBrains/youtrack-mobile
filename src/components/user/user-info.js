/* @flow */

import {View, Text} from 'react-native';
import React, {PureComponent} from 'react';

import {getEntityPresentation, relativeDate} from '../issue-formatter/issue-formatter';

import styles from './user-info.styles';

import type {User} from '../../flow/User';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';
import Avatar from '../avatar/avatar';

type Props = {
  user: User,
  timestamp: number,
  style?: ViewStyleProp,
};

export default class UserInfo extends PureComponent<Props, void> {

  render() {
    const {user, style, timestamp} = this.props;
    const userName: string = getEntityPresentation(user);

    return (
      <View
        style={[styles.user, style]}
        testID="UserInfo"
      >
        {Boolean(user.avatarUrl) && <Avatar
          testID="UserInfoAvatar"
          userName={userName}
          size={40}
          source={{uri: user.avatarUrl}}
        />}

        {Boolean(userName) && <Text
          style={styles.userName}
          testID="UserInfoName"
        >
          {userName}
        </Text>}

        <Text
          testID="UserInfoTimestamp"
          style={styles.timestamp}>
          {relativeDate(timestamp)}
        </Text>
      </View>
    );
  }
}
