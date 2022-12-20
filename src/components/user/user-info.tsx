import {View, Text} from 'react-native';
import React, {PureComponent} from 'react';
import Avatar from '../avatar/avatar';
import {getEntityPresentation} from '../issue-formatter/issue-formatter';
import {ytDate} from 'components/date/date';
import styles from './user-info.styles';
import type {User} from 'types/User';
import type {ViewStyleProp} from 'types/Internal';
type Props = {
  additionalInfo?: string;
  avatar?: React.ReactElement<React.ComponentProps<any>, any>;
  style?: ViewStyleProp;
  timestamp: number;
  user: User;
};
export default class UserInfo extends PureComponent<Props, void> {
  render(): React.ReactNode {
    const {user, style, timestamp, avatar, additionalInfo} = this.props;
    const userName: string = getEntityPresentation(user);
    return (
      <View style={[styles.user, style]} testID="UserInfo">
        {Boolean(user.avatarUrl) && !avatar && (
          <Avatar
            testID="UserInfoAvatar"
            userName={userName}
            size={32}
            style={styles.userAvatar}
            source={{
              uri: user.avatarUrl,
            }}
          />
        )}

        {!!avatar && <View style={styles.userAvatar}>{avatar}</View>}

        {Boolean(userName) && (
          <Text style={styles.userName} testID="UserInfoName">
            {userName}
            {!!additionalInfo && (
              <Text testID="UserAdditionalInfo">{additionalInfo}</Text>
            )}
          </Text>
        )}

        <View style={styles.timestampContainer}>
          <Text testID="UserInfoTimestamp" style={styles.timestamp}>
            {ytDate(timestamp)}
          </Text>
        </View>
      </View>
    );
  }
}
