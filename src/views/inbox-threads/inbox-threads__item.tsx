import React, {useContext} from 'react';
import {TouchableOpacity, View} from 'react-native';

import StreamHistoryChange from 'components/activity-stream/activity__stream-history';
import UserInfo from 'components/user/user-info';
import {HIT_SLOP2} from 'components/common-styles';
import {ThemeContext} from 'components/theme/theme-context';

import styles from './inbox-threads.styles';

import type {Activity} from 'types/Activity';
import type {InboxThreadGroup} from 'types/Inbox';
import type {Theme} from 'types/Theme';
import type {User} from 'types/User';
import {Entity} from 'types/Entity';

type Props = {
  author: User;
  avatar: React.ReactNode;
  avatarStyle?: Record<string, string>;
  change?: any;
  group?: InboxThreadGroup;
  reason: string;
  timestamp: number;
  onNavigate?: (entity: Entity, navigateToActivity?: string) => any;
};


export default function ThreadItem({
  author,
  avatar,
  avatarStyle,
  change,
  group,
  reason,
  timestamp,
  onNavigate,
}: Props) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const theme: Theme = useContext(ThemeContext);
  return (
    <View
      testID="test:id/inboxThreadItem"
      accessibilityLabel="inboxThreadItem"
      accessible={true}
    >
      <UserInfo
        additionalInfo={reason}
        avatar={avatar}
        avatarStyle={avatarStyle}
        timestamp={timestamp}
        user={author}
      />
      <TouchableOpacity
        testID="test:id/inboxThreadItemNavigateButton"
        accessibilityLabel="inboxThreadItemNavigateButton"
        accessible={true}
        style={styles.threadChange}
        disabled={typeof onNavigate !== 'function'}
        onPress={onNavigate}
        hitSlop={HIT_SLOP2}
      >
        <>
          {change}
          {!!group?.mergedActivities?.length && (
            <View
              testID="test:id/inboxThreadItemMergedActivities"
              accessibilityLabel="inboxThreadItemMergedActivities"
              accessible={true}
              style={styles.threadRelatedChange}
            >
              {group.mergedActivities.map((activity: Activity) => (
                <StreamHistoryChange
                  key={`${group.head.id}${group.head.timestamp}${activity.id}`}
                  activity={activity}
                />
              ))}
            </View>
          )}
        </>
      </TouchableOpacity>
    </View>
  );
}
