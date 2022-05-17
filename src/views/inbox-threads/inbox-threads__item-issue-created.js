/* @flow */

import React from 'react';
import {Text, View} from 'react-native';

import MarkdownViewChunks from '../../components/wiki/markdown-view-chunks';
import StreamHistoryTextChange from 'components/activity-stream/activity__stream-history__text-change';
import StreamTimestamp from 'components/activity-stream/activity__stream-timestamp';
import {activityCategory} from 'components/activity/activity__category';
import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';
import {getTextValueChange} from 'components/activity/activity__history-value';
import {i18n} from 'components/i18n/i18n';
import {IconHistory} from 'components/icon/icon';
import {markdownText} from '../../components/common-styles/typography';

import styles from './inbox-threads.styles';

import {InboxThreadGroup} from 'flow/Inbox';
import type {AnyIssue} from 'flow/Issue';
import type {CustomField} from 'flow/CustomFields';
import type {UITheme} from '../../flow/Theme';

interface Props {
  group: InboxThreadGroup;
  isLast: boolean;
  uiTheme: UITheme;
}

export default function ThreadIssueCreatedItem({group, isLast, uiTheme}: Props): React$Element<typeof View> {
  const actualActivity: Props['group']['issue'] = group.issue;
  const issue: AnyIssue = actualActivity.issue;
  const assigneeField: ?CustomField = issue.customFields[0];
  const assignees = assigneeField && (Array.isArray(assigneeField.value) ? assigneeField.value : [assigneeField.value]);
  if (!assignees && !assigneeField) {
    return null;
  }
  const activity = {
    category: {id: activityCategory.CUSTOM_FIELD},
    added: assignees,
    field: {
      customField: assigneeField,
      presentation: assigneeField.name,
    },
  };
  const textValueChange = getTextValueChange({activity});

  return (
    <View>
      {!isLast && <View style={styles.threadConnector}/>}
      <View style={styles.row}>
        <View style={styles.threadTitleIcon}>
          <IconHistory size={16} color={styles.icon.color}/>
        </View>
        <View>
          <Text style={styles.threadChangeAuthor}>
            {getEntityPresentation(actualActivity.author)}
          </Text>
          <View style={styles.row}>
            <Text style={styles.threadChangeReason}>{i18n('created')}</Text>
            <StreamTimestamp timestamp={actualActivity.timestamp}/>
          </View>
        </View>
      </View>
      <View style={[styles.threadChange, styles.threadChangeMarkdown]}>
        {Boolean(issue.description) && (
          <MarkdownViewChunks
            textStyle={markdownText}
            attachments={issue.attachments}
            chunkSize={3}
            maxChunks={1}
            uiTheme={uiTheme}
          >
            {issue.description.trim()}
          </MarkdownViewChunks>
        )}
        <StreamHistoryTextChange activity={activity} textChange={{added: textValueChange}}/>
      </View>
    </View>
  );
}
