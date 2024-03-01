import React from 'react';
import {Text, View} from 'react-native';

import Avatar from 'components/avatar/avatar';
import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';
import {ytDate} from 'components/date/date';

import styles from './user-info.styles';

import type {ViewStyleProp} from 'types/Internal';
import type {User} from 'types/User';

interface Props {
  additionalInfo?: string | React.ReactElement;
  avatar?: React.ReactNode;
  avatarStyle?: Record<string, string>;
  style?: ViewStyleProp;
  timestamp: number;
  user: User;
}

export default function UserInfo(props: Props): React.JSX.Element {
  const {user, style, timestamp, avatar, avatarStyle, additionalInfo} = props;
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

      {!!avatar && <View style={[styles.userAvatar, avatarStyle]}>{avatar}</View>}

      {!!userName && (
        <View style={styles.userInfo}>
          <Text testID="UserInfoName" style={styles.userName}>
            {userName}
          </Text>
          <View>
            <Text>
              {!!additionalInfo && (
                <Text testID="UserAdditionalInfo" style={styles.additionalInfo}>
                  {`${additionalInfo} `}
                </Text>
              )}
              <Text testID="UserInfoTimestamp" style={styles.additionalInfo}>
                {ytDate(timestamp)}
              </Text>
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
