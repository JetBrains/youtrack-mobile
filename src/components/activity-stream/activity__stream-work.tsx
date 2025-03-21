import * as React from 'react';
import {Text, TouchableWithoutFeedback, View} from 'react-native';

import MarkdownView from 'components/wiki/markdown-view';
import StreamUserInfo from './activity__stream-user-info';
import {absDate} from 'components/date/date';
import {firstActivityChange, getDurationPresentation} from './activity__stream-helper';
import {i18n} from 'components/i18n/i18n';
import {markdownText} from 'components/common-styles';

import styles from './activity__stream.styles';

import type {ActivityGroup} from 'types/Activity';
import type {WorkItem} from 'types/Work';

interface Props {
  activityGroup: ActivityGroup;
  onUpdate?: (workItem?: WorkItem) => any;
  onLongPress?: () => any;
}

const bulletChar = `⦁\u2009`;

const StreamWork = (props: Props) => {
  const work = firstActivityChange(props.activityGroup.work) as WorkItem | null;

  if (!work) {
    return null;
  }

  return (
    <TouchableWithoutFeedback delayLongPress={280} onLongPress={props?.onLongPress}>
      <View>
        {!props.activityGroup.merged && props.activityGroup.author && (
          <StreamUserInfo activityGroup={props.activityGroup} />
        )}

        <View style={[styles.activityChange, props.activityGroup.merged && styles.activityChangeMerged]}>
          <Text style={styles.secondaryTextColor}>
            <Text style={styles.activityLabel}>{i18n('Spent time:')}</Text>
            <Text style={styles.activityWorkTime}>{` ${getDurationPresentation(work.duration)}`}</Text>

            {!!work.type && (
              <Text style={styles.activityWorkTime}>
                {`, `}
                {work.type.color && <Text style={{color: work.type?.color?.background}}>{bulletChar}</Text>}
                {work.type.name}
              </Text>
            )}
            {work.attributes?.length
              ? work.attributes.map(attr => {
                return attr.value ? (
                  <Text style={styles.activityWorkTime}>
                    {', '}
                    {!!attr.value?.color && (
                      <Text style={{color: attr.value.color.background}}>{bulletChar}</Text>
                    )}
                    {attr.value.name}
                  </Text>
                ) : null;
              })
              : null}
            {!!work.date && `, ${absDate(work.date, true)}`}
          </Text>

          {!!work.text && (
            <MarkdownView
              textStyle={markdownText}
              onCheckboxUpdate={(checked: boolean, position: number, workItemText: string): void => {
                if (props.onUpdate) {
                  props.onUpdate({...work, text: workItemText});
                }
              }}
            >
              {work.text}
            </MarkdownView>
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default React.memo<Props>(StreamWork);
