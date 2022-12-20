import React from 'react';
import {Text, View} from 'react-native';
import Router from '../router/router';
import {getActivityEventTitle} from './activity__stream-helper';
import {getReadableID} from '../issue-formatter/issue-formatter';
import styles from './activity__stream.styles';
import type {Activity} from 'flow/Activity';
import type {IssueFull} from 'flow/Issue';
type Props = {
  activity: Activity;
};
type LinkedIssue = IssueFull & {
  isRemoved?: boolean;
};

const StreamLink = (props: Props) => {
  const added: Array<LinkedIssue> = props.activity.added as any;
  const removed: Array<LinkedIssue> = (props.activity
    .removed as any).map((issue: LinkedIssue) => ({...issue, isRemoved: true}));
  const linkedIssues: Array<LinkedIssue> = [].concat(added).concat(removed);
  return (
    <>
      <View>
        <Text style={styles.activityLabel}>
          {getActivityEventTitle(props.activity)}
        </Text>
      </View>
      {linkedIssues.map((linkedIssue: LinkedIssue) => {
        const readableIssueId: string = getReadableID(linkedIssue);
        return (
          <Text
            key={linkedIssue.id}
            style={{
              ...styles.linkedIssue,
              ...(linkedIssue.isRemoved ? styles.activityRemoved : {}),
            }}
            onPress={() =>
              Router.Issue({
                issueId: readableIssueId,
              })
            }
          >
            <Text
              style={[
                styles.link,
                linkedIssue.resolved && styles.secondaryTextColor.color,
                linkedIssue.resolved && styles.activityRemoved,
              ]}
            >
              {readableIssueId}
            </Text>
            <Text
              style={[
                styles.link,
                linkedIssue.resolved && styles.secondaryTextColor.color,
              ]}
            >
              {` ${linkedIssue.summary}`}
            </Text>
          </Text>
        );
      })}
    </>
  );
};

export default React.memo<Props>(StreamLink) as React$AbstractComponent<
  Props,
  unknown
>;