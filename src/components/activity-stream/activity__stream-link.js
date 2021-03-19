/* @flow */

import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

import Router from '../router/router';
import {getActivityEventTitle} from './activity__stream-helper';
import {getReadableID} from '../issue-formatter/issue-formatter';

import styles from './activity__stream.styles';

import type {Activity} from '../../flow/Activity';
import type {IssueFull} from '../../flow/Issue';

type Props = {
  activity: Activity
}

const StreamLink = (props: Props) => {
  const linkedIssues = [].concat(props.activity.added).concat(
    props.activity.removed.map((link: IssueFull) => ({...link, isRemoved: true}))
  );

  return (
    <TouchableOpacity key={props.activity.id}>
      <View>
        <Text style={styles.activityLabel}>{getActivityEventTitle(props.activity)}</Text>
      </View>
      {
        linkedIssues.map((linkedIssue: IssueFull & { isRemoved?: boolean }) => {
          const readableIssueId: string = getReadableID(linkedIssue);
          return (
            <Text
              key={linkedIssue.id}
              style={{...styles.linkedIssue, ...(linkedIssue.isRemoved ? styles.activityRemoved : {})}}
              onPress={() => Router.Issue({issueId: readableIssueId})}>
              <Text style={[
                styles.link,
                linkedIssue.resolved && styles.secondaryTextColor.color,
                linkedIssue.resolved && styles.activityRemoved,
              ]}>
                {readableIssueId}
              </Text>
              <Text style={[
                styles.link,
                linkedIssue.resolved && styles.secondaryTextColor.color,
              ]}>
                {` ${linkedIssue.summary}`}
              </Text>
            </Text>
          );
        })
      }
    </TouchableOpacity>
  );
};

export default React.memo<Props>(StreamLink);
