/* @flow */

import React from 'react';
import {Text, View} from 'react-native';

import MarkdownViewChunks from 'components/wiki/markdown-view-chunks';
import StreamHistoryChange from 'components/activity-stream/activity__stream-history';
import StreamTimestamp from 'components/activity-stream/activity__stream-timestamp';
import {activityCategory} from 'components/activity/activity__category';
import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';
import {i18n} from 'components/i18n/i18n';
import {IconHistory} from 'components/icon/icon';
import {markdownText} from 'components/common-styles/typography';

import styles from './inbox-threads.styles';

import {InboxThreadGroup} from 'flow/Inbox';
import type {AnyIssue} from 'flow/Issue';
import type {CustomField} from 'flow/CustomFields';
import type {UITheme} from 'flow/Theme';

interface Props {
  group: InboxThreadGroup;
  isLast: boolean;
  uiTheme: UITheme;
}

export default function ThreadIssueCreatedItem({group, isLast, uiTheme}: Props): ?React$Element<typeof View> {
  const actualActivity: Props['group']['issue'] = group.issue;
  const issue: AnyIssue = actualActivity.issue;
  const assigneeFields: CustomField[] = (issue.customFields || []).map((it: CustomField) => {
    return {
      ...it,
      projectCustomField: {
        ...it.projectCustomField,
        field: {id: it.id},
      },
    };
  });
  const added = assigneeFields.reduce(
    (acc: CustomField[], it: CustomField) => acc.concat(it.value), []
  ).filter(Boolean);

  const activity = {
    category: {id: activityCategory.CUSTOM_FIELD},
    added: added.length > 0 ? added : null,
    removed: [],
    field: {
      presentation: assigneeFields[0].name,
      customField: {
        id: assigneeFields[0].id,
        fieldType: {
          isMultiValue: assigneeFields.length > 1,
        },
      },
    },
  };

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
        <StreamHistoryChange activity={activity} customFields={assigneeFields}/>
      </View>
    </View>
  );
}
