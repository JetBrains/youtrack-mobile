/* @flow */

import React from 'react';
import {Text, TouchableOpacity} from 'react-native';

import {HIT_SLOP} from '../../components/common-styles/button';
import {getReadableID} from 'components/issue-formatter/issue-formatter';

import styles from './inbox.styles';

import type {AnyIssue} from 'flow/Issue';
import type {Article} from 'flow/Article';
import type {TextStyleProp, ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

export default function InboxEntity({entity, onNavigate, style, styleText}: {
  entity: (AnyIssue | Article),
  onNavigate: () => void,
  style?: ViewStyleProp,
  styleText?: TextStyleProp,
}) {
  const readableID: ?string = getReadableID(entity);
  return (
    <TouchableOpacity
      hitSlop={HIT_SLOP}
      style={style}
      onPress={onNavigate}
    >
      <Text>
        {!!readableID && (
          <Text style={[
            styles.notificationIssueInfo,
            styleText,
            entity.resolved ? styles.resolved : null,
          ]}>{readableID}</Text>
        )}
        {!!entity.summary && (
          <Text
            numberOfLines={2}
            style={[styles.notificationIssueInfo, styles.linkColor, styleText]}
          >
            {` ${entity.summary}`}
          </Text>
        )}
      </Text>
    </TouchableOpacity>
  );
}

