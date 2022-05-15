/* @flow */

import React from 'react';
import {Text, TouchableOpacity} from 'react-native';

import {getReadableID} from 'components/issue-formatter/issue-formatter';

import styles from './inbox.styles';

import type {AnyIssue} from 'flow/Issue';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

export default function InboxIssue({issue, onNavigateToIssue, style}: {
  issue: AnyIssue,
  onNavigateToIssue: () => void,
  style?: ViewStyleProp,
}) {
  const readableID: ?string = getReadableID(issue);
  return (
    <TouchableOpacity
      style={style}
      onPress={onNavigateToIssue}
    >
      <Text>
        {!!readableID && (
          <Text style={[
            styles.notificationIssueInfo,
            issue.resolved ? styles.resolved : null,
          ]}>{readableID}</Text>
        )}
        {!!issue.summary && (
          <Text
            numberOfLines={2}
            style={[styles.notificationIssueInfo, styles.linkColor]}
          >
            {` ${issue.summary}`}
          </Text>
        )}
      </Text>
    </TouchableOpacity>
  );
}

