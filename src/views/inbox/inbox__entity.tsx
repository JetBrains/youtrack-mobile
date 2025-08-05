import React from 'react';
import {Text, TouchableOpacity} from 'react-native';

import {HIT_SLOP} from 'components/common-styles';
import {getReadableID} from 'components/issue-formatter/issue-formatter';

import styles from './inbox.styles';

import type {AnyIssue} from 'types/Issue';
import type {Article} from 'types/Article';
import type {InboxThreadTarget} from 'types/Inbox';
import type {TextStyleProp} from 'types/Internal';
import type {TouchableWithoutFeedbackProps} from 'react-native';

interface Props extends TouchableWithoutFeedbackProps {
  entity: AnyIssue | Article | InboxThreadTarget;
  onNavigate: () => void;
  styleText?: TextStyleProp;
}

export default function InboxEntity({entity, onNavigate, styleText, ...otherProps}: Props) {
  const readableID = getReadableID(entity);
  return (
    <TouchableOpacity hitSlop={HIT_SLOP} onPress={onNavigate} {...otherProps}>
      <Text numberOfLines={1}>
        {!!readableID && (
          <Text
            testID="test:id/inboxEntityReadableId"
            accessibilityLabel="inboxEntityReadableId"
            accessible={true}
            style={[
              styles.notificationIssueInfo,
              styleText,
              'resolved' in entity && entity.resolved ? styles.resolved : null,
            ]}
          >
            {readableID}
          </Text>
        )}
        {!!('summary' in entity && entity.summary) && (
          <Text
            testID="test:id/inboxEntitySummary"
            accessibilityLabel="inboxEntitySummary"
            accessible={true}
            style={[styles.notificationIssueInfo, styles.linkColor, styleText]}
          >
            {` ${entity.summary}`}
          </Text>
        )}
      </Text>
    </TouchableOpacity>
  );
}
