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

const StreamWork = (props: Props) => {
  const work = firstActivityChange(props.activityGroup.work) as WorkItem | null;

  if (!work) {
    return null;
  }

  return (
    <TouchableWithoutFeedback delayLongPress={280} onLongPress={props?.onLongPress}>
      <>
        {!props.activityGroup.merged && props.activityGroup.author && (
          <StreamUserInfo activityGroup={props.activityGroup}/>
        )}

        <View style={[styles.activityChange, props.activityGroup.merged && styles.activityChangeMerged]}>
          <Text style={styles.secondaryTextColor}>
            <Text style={styles.activityLabel}>{i18n('Spent time:')}</Text>
            <Text style={styles.activityWorkTime}>
              {` ${getDurationPresentation(work.duration)}`}
            </Text>
            {!!work.type && `, ${work.type.name}`}
            {!!work.date && `, ${absDate(work.date, true)}`}
          </Text>

          {!!work.text && (
            <MarkdownView
              textStyle={markdownText}
              onCheckboxUpdate={(
                checked: boolean,
                position: number,
                workItemText: string,
              ): void => {
                if (props.onUpdate) {
                  props.onUpdate({...work, text: workItemText});
                }
              }}
            >
              {work.text}
            </MarkdownView>
          )}
        </View>
      </>
    </TouchableWithoutFeedback>
  );
};

export default React.memo<Props>(StreamWork);
