/* @flow */

import React from 'react';
import {Text, TouchableOpacity} from 'react-native';

import {getReadableID} from 'components/issue-formatter/issue-formatter';

import styles from './inbox.styles';

import type {AnyIssue} from 'flow/Issue';
import type {Article} from 'flow/Article';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

export default function InboxEntity({entity, onNavigate, style}: {
  entity: (AnyIssue | Article),
  onNavigate: () => void,
  style?: ViewStyleProp,
}) {
  const readableID: ?string = getReadableID(entity);
  return (
    <TouchableOpacity
      style={style}
      onPress={onNavigate}
    >
      <Text>
        {!!readableID && (
          <Text style={[
            styles.notificationIssueInfo,
            entity.resolved ? styles.resolved : null,
          ]}>{readableID}</Text>
        )}
        {!!entity.summary && (
          <Text
            numberOfLines={2}
            style={[styles.notificationIssueInfo, styles.linkColor]}
          >
            {` ${entity.summary}`}
          </Text>
        )}
      </Text>
    </TouchableOpacity>
  );
}

