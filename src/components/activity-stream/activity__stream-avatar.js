/* @flow */

import React from 'react';
import {View} from 'react-native';

import ActivityIcon from './activity__stream-icon';
import Avatar from 'components/avatar/avatar';
import {getEntityPresentation} from '../issue-formatter/issue-formatter';

import styles from './activity__stream.styles';

interface Props {
  activityGroup: Object,
  showAvatar: boolean,
}

const ActivityUserAvatar = ({activityGroup, showAvatar}: Props): React$Element<typeof View> => {
  const shouldRenderIcon: boolean = Boolean(!activityGroup.merged && !showAvatar);

  return (
    <View style={styles.activityAvatar}>
      {Boolean(!activityGroup.merged && showAvatar) && (
        <Avatar
          userName={getEntityPresentation(activityGroup.author)}
          size={32}
          source={{uri: activityGroup.author.avatarUrl}}
        />
      )}
      {shouldRenderIcon && <ActivityIcon activityGroup={activityGroup}/>}
    </View>
  );
};

export default ActivityUserAvatar;
