import * as React from 'react';
import {Text, TouchableWithoutFeedback, View} from 'react-native';

import MarkdownView from 'components/wiki/markdown-view';
import StreamUserInfo from './activity__stream-user-info';
import {firstActivityChange, getDurationPresentation} from './activity__stream-helper';
import {i18n} from 'components/i18n/i18n';
import {markdownText} from 'components/common-styles';
import {ytDate} from 'components/date/date';

import styles from './activity__stream.styles';

import type {ActivityGroup} from 'types/Activity';
import type {WorkItem} from 'types/Work';

type Props = {
  activityGroup: ActivityGroup;
  onUpdate?: (workItem?: WorkItem) => any;
  onLongPress?: () => any;
};

const StreamWork = (props: Props) => {
  const work: WorkItem | null = firstActivityChange(props.activityGroup.work);

  if (!work) {
    return null;
  }

  return (
    <TouchableWithoutFeedback delayLongPress={280} onLongPress={props?.onLongPress}>
      <View>
        {!props.activityGroup.merged && props.activityGroup.author && (
          <StreamUserInfo activityGroup={props.activityGroup}/>
        )}

        <View style={styles.activityChange}>
          {Boolean(work.created) && (
            <Text style={styles.secondaryTextColor}>
              {ytDate(work.created, true)}
            </Text>
          )}

          <Text>
            <Text style={styles.activityLabel}>{i18n('Spent time:')}</Text>
            <Text style={styles.activityWorkTime}>
              {` ${getDurationPresentation(work.duration)}`}
            </Text>
            {work.type && (
              <Text
                style={styles.secondaryTextColor}
              >{`, ${work.type.name}`}</Text>
            )}
          </Text>

          {!!work.text && (
            <View style={work.id && styles.activityWorkComment}>
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
            </View>
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default React.memo<Props>(StreamWork);
