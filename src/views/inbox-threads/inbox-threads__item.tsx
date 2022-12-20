import React, {useContext} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import StreamHistoryChange from 'components/activity-stream/activity__stream-history';
import StreamTimestamp from 'components/activity-stream/activity__stream-timestamp';
import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';
import styles from './inbox-threads.styles';
import type {Activity} from 'types/Activity';
import type {InboxThreadGroup, ThreadEntity} from 'types/Inbox';
import type {User} from 'types/User';
import type {Theme} from '../../types/Theme';
import {ThemeContext} from 'components/theme/theme-context';
type Props = {
  author: User;
  avatar: any;
  change?: any;
  group?: InboxThreadGroup;
  reason: string;
  timestamp: number;
  onNavigate?: (entity: ThreadEntity, navigateToActivity?: string) => any;
};
export default function ThreadItem({
  author,
  avatar,
  change,
  group,
  reason,
  timestamp,
  onNavigate,
}: Props) {
  // eslint-disable-next-line no-unused-vars
  const theme: Theme = useContext(ThemeContext);
  return (
    <View
      testID="test:id/inboxThreadItem"
      accessibilityLabel="inboxThreadItem"
      accessible={true}
    >
      <View style={styles.row}>
        <View style={styles.threadTitleIcon}>{avatar}</View>
        <View>
          <Text style={styles.threadChangeAuthor}>
            {getEntityPresentation(author)}
          </Text>
          <View style={styles.row}>
            <Text
              testID="test:id/inboxThreadItemReason"
              accessibilityLabel="inboxThreadItemReason"
              accessible={true}
              style={styles.threadChangeReason}
            >
              {reason}
            </Text>
            <StreamTimestamp timestamp={timestamp} />
          </View>
        </View>
      </View>

      <TouchableOpacity
        testID="test:id/inboxThreadItemNavigateButton"
        accessibilityLabel="inboxThreadItemNavigateButton"
        accessible={true}
        style={styles.threadChange}
        disabled={typeof onNavigate !== 'function'}
        onPress={onNavigate}
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
