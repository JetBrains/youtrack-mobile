/* @flow */

import React from 'react';
import {Text, View} from 'react-native';

import StreamUserInfo from './activity__stream-user-info';
import {firstActivityChange} from './activity__stream-helper';
import {minutesAndHoursFor} from '../time-tracking/time-tracking';
import {ytDate} from '../issue-formatter/issue-formatter';

import styles from './activity__stream.styles';

import type {Activity} from '../../flow/Activity';

type Props = {
  activityGroup: Activity
}

const StreamWork = (props: Props) => {
  const work = firstActivityChange(props.activityGroup.work);

  if (!work) {
    return null;
  }

  const duration = minutesAndHoursFor(work.duration);
  const spentTime = [duration.hours(), duration.minutes()].join(' ');

  return (
    <View>
      {!props.activityGroup.merged && <StreamUserInfo activityGroup={props.activityGroup}/>}

      <View style={styles.activityChange}>

        {Boolean(work.date) && <Text style={styles.secondaryTextColor}>{ytDate(work.date)}</Text>}

        <Text>
          <Text style={styles.activityLabel}>Spent time: </Text>
          <Text style={styles.activityWorkTime}>{spentTime}</Text>
          {work.type && <Text style={styles.secondaryTextColor}>{` ${work.type.name}`}</Text>}
        </Text>

        {!!work.text && (
          <View style={styles.activityWorkComment}><Text style={styles.secondaryTextColor}>{work.text}</Text></View>
        )}

      </View>
    </View>
  );
};

export default React.memo<Props>(StreamWork);
