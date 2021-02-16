/* @flow */

import React from 'react';
import {Text, View, TouchableOpacity} from 'react-native';

import AddSpentTimeForm from '../../views/issue/activity/activity__add-spent-time';
import Router from '../router/router';
import StreamUserInfo from './activity__stream-user-info';
import {firstActivityChange, getDurationPresentation} from './activity__stream-helper';
import {HIT_SLOP} from '../common-styles/button';
import {IconPencil} from '../icon/icon';
import {ytDate} from '../issue-formatter/issue-formatter';

import styles from './activity__stream.styles';

import type {Activity} from '../../flow/Activity';

type Props = {
  activityGroup: Activity,
  canUpdate?: boolean,
  onUpdate?: () => any
}

const StreamWork = (props: Props) => {
  const work = firstActivityChange(props.activityGroup.work);

  if (!work) {
    return null;
  }

  return (
    <View>
      {!props.activityGroup.merged && <StreamUserInfo activityGroup={props.activityGroup}/>}

      <View style={styles.activityChange}>

        {Boolean(work.date) && <Text style={styles.secondaryTextColor}>{ytDate(work.date)}</Text>}

        <View style={styles.activityWork}>
          <Text>
            <Text style={styles.activityLabel}>Spent time: </Text>
            <Text style={styles.activityWorkTime}>{getDurationPresentation(work.duration)}</Text>
            {work.type && <Text style={styles.secondaryTextColor}>{`, ${work.type.name}`}</Text>}
          </Text>
          {props.canUpdate && (
            <TouchableOpacity
              hitSlop={HIT_SLOP}
              style={styles.activityWorkEditIcon}
              onPress={() => {
                Router.PageModal({
                  children: (
                    <AddSpentTimeForm
                      workItem={props.activityGroup.work.added[0]}
                      onAdd={props.onUpdate}
                    />
                  )
                });
              }}
            >
              <IconPencil size={18} color={styles.activityCommentActionsAddReaction.color}/>
            </TouchableOpacity>
          )}
        </View>

        {!!work.text && (
          <View style={styles.activityWorkComment}><Text style={styles.secondaryTextColor}>{work.text}</Text></View>
        )}

      </View>
    </View>
  );
};

export default React.memo<Props>(StreamWork);
