import React from 'react';
import {View} from 'react-native';

import FastImage from 'react-native-fast-image';

import ActivityIcon from './activity__stream-icon';
import Avatar from 'components/avatar/avatar';
import {getEntityPresentation} from '../issue-formatter/issue-formatter';

import styles from './activity__stream.styles';

import type {ViewStyleProp} from 'types/Internal';
import {ActivityGroup} from 'types/Activity';

interface Props {
  activityGroup: ActivityGroup;
  showAvatar: boolean;
  size?: number;
  style?: ViewStyleProp;
}

const ActivityUserAvatar = ({activityGroup, showAvatar, size = 32, style}: Props) => {
  const shouldRenderIcon: boolean = Boolean(!activityGroup.merged && !showAvatar);
  const athorGroupIcon = activityGroup.authorGroup?.icon;
  return (
    <View style={[styles.activityAvatar, !showAvatar && styles.activityAvatarIcon, style]}>
      {Boolean(!activityGroup.merged && showAvatar) && (
        <>
          <Avatar
            userName={getEntityPresentation(activityGroup.author)}
            size={size}
            source={{
              uri: activityGroup.author.avatarUrl,
            }}
          />
          {athorGroupIcon && <FastImage style={styles.activityAvatarGroupIcon} source={{uri: athorGroupIcon}} />}
        </>
      )}
      {shouldRenderIcon && <ActivityIcon activityGroup={activityGroup} />}
    </View>
  );
};

export default ActivityUserAvatar;
