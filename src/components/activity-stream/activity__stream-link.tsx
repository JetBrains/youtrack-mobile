import React from 'react';

import {Text, View} from 'react-native';
import Router from 'components/router/router';

import {getActivityEventTitle} from './activity__stream-helper';
import {getReadableID} from '../issue-formatter/issue-formatter';

import styles from './activity__stream.styles';

import type {Activity} from 'types/Activity';
import type {IssueFull} from 'types/Issue';

interface Props {
  activity: Activity;
}

interface LinkedIssue extends IssueFull {
  isRemoved: boolean;
}

const StreamLink = (props: Props) => {
  const added = props.activity.added as LinkedIssue[];
  const removed = props.activity.removed as LinkedIssue[];
  removed.forEach(issue => (issue.isRemoved = true));
  const linkedIssues = [...added, ...removed];
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

export default React.memo<Props>(StreamLink);
