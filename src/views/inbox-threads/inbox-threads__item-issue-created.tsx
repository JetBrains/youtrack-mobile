import React from 'react';
import {View} from 'react-native';

import MarkdownViewChunks from 'components/wiki/markdown-view-chunks';
import StreamHistoryChange from 'components/activity-stream/activity__stream-history';
import ThreadItem from './inbox-threads__item';
import {activityCategory} from 'components/activity/activity__category';
import {i18n} from 'components/i18n/i18n';
import {IconHistory} from 'components/icon/icon';
import {InboxThreadGroup} from 'types/Inbox';
import {markdownText} from 'components/common-styles';

import styles from './inbox-threads.styles';

import type {CustomField} from 'types/CustomFields';
import type {InboxThreadTarget} from 'types/Inbox';
import type {UITheme} from 'types/Theme';
import {Entity} from 'types/Global';


type Props = {
  group: InboxThreadGroup;
  target: InboxThreadTarget;
  uiTheme: UITheme;
  onNavigate: (entity: Entity, navigateToActivity?: boolean) => any;
};


export default function ThreadEntityCreatedItem({
  group,
  target,
  uiTheme,
  onNavigate,
}: Props) {
  const actualActivity = group.issue;
  const entity: Entity = actualActivity.issue || actualActivity.article;
  const assigneeFields: CustomField[] = (entity.customFields || []).map(
    (it: CustomField) => {
      return {
        ...it,
        projectCustomField: {
          ...it.projectCustomField,
          field: {
            id: it.id,
          },
        },
      };
    },
  );
  const added = assigneeFields
    .reduce((acc: CustomField[], it: CustomField) => acc.concat(it.value), [])
    .filter(Boolean);
  const activity = {
    category: {
      id: activityCategory.CUSTOM_FIELD,
    },
    added: added.length > 0 ? added : null,
    removed: [],
    field: {
      presentation: assigneeFields[0]?.name,
      customField: {
        id: assigneeFields[0]?.id,
        fieldType: {
          isMultiValue: assigneeFields.length > 1,
        },
      },
    },
  };
  const description: string = entity.description || entity.content;
  return (
    <ThreadItem
      author={actualActivity.author}
      avatar={<IconHistory size={20} color={styles.icon.color} />}
      change={
        <>
          {Boolean(description) && (
            <MarkdownViewChunks
              textStyle={markdownText}
              attachments={entity.attachments}
              chunkSize={3}
              maxChunks={1}
              uiTheme={uiTheme}
            >
              {description.trim()}
            </MarkdownViewChunks>
          )}
          <View style={styles.threadRelatedChange}>
            <StreamHistoryChange
              activity={activity}
              customFields={assigneeFields}
            />
          </View>
        </>
      }
      onNavigate={() => onNavigate(target)}
      reason={i18n('created')}
      timestamp={actualActivity.timestamp}
    />
  );
}
