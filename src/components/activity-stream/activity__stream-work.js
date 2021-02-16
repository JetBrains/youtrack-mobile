/* @flow */

import React from 'react';
import {Text, View, TouchableOpacity} from 'react-native';

import {useActionSheet} from '@expo/react-native-action-sheet';
import {useSelector} from 'react-redux';

import AddSpentTimeForm from '../../views/issue/activity/activity__add-spent-time';
import IssuePermissions from '../issue-permissions/issue-permissions';
import Router from '../router/router';
import StreamUserInfo from './activity__stream-user-info';
import {ANALYTICS_ISSUE_STREAM_SECTION} from '../analytics/analytics-ids';
import {firstActivityChange, getDurationPresentation} from './activity__stream-helper';
import {HIT_SLOP} from '../common-styles/button';
import {IconContextActions} from '../icon/icon';
import {logEvent} from '../log/log-helper';
import {showActionSheet} from '../action-sheet/action-sheet';
import {ytDate} from '../issue-formatter/issue-formatter';

import styles from './activity__stream.styles';

import type {Activity} from '../../flow/Activity';
import type {ActionSheetOption} from '../action-sheet/action-sheet';
import type {AppState} from '../../reducers';
import type {IssueFull} from '../../flow/Issue';
import type {WorkItem} from '../../flow/Work';

type Props = {
  activityGroup: Activity,
  onDelete?: (workItem: WorkItem) => any,
  onUpdate?: () => any
}

type WorkPermissions = { canUpdate: boolean, canDelete: boolean };


const StreamWork = (props: Props) => {
  const issuePermissions: IssuePermissions = useSelector((state: AppState) => state.app.issuePermissions);
  const issue: IssueFull = useSelector((state: AppState) => state.issueState.issue);
  const {showActionSheetWithOptions} = useActionSheet();

  const work: ?WorkItem = firstActivityChange(props.activityGroup.work);

  if (!work) {
    return null;
  }

  const workPermissions: WorkPermissions = canChangeWork(work);
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
          {(workPermissions.canUpdate || workPermissions.canDelete) && (
            <TouchableOpacity
              hitSlop={HIT_SLOP}
              style={styles.activityWorkEditIcon}
              onPress={showContextActions}
            >
              <IconContextActions size={18} color={styles.activityCommentActionsAddReaction.color}/>
            </TouchableOpacity>
          )}
        </View>

        {!!work.text && (
          <View style={styles.activityWorkComment}><Text style={styles.secondaryTextColor}>{work.text}</Text></View>
        )}

      </View>
    </View>
  );

  function canChangeWork(workItem: WorkItem): WorkPermissions {
    const canUpdate: boolean = issuePermissions.canUpdateWork(issue, workItem);
    const canDelete: boolean = issuePermissions.canDeleteWork(issue, workItem);
    return {...{canUpdate}, ...{canDelete}};
  }

  async function showContextActions() {
    const options: Array<ActionSheetOption> = [];

    if (workPermissions.canUpdate) {
      options.push({
        title: 'Edit',
        execute: () => {
          logEvent({
            message: 'SpentTime: actions:update',
            analyticsId: ANALYTICS_ISSUE_STREAM_SECTION
          });
          Router.PageModal({
            children: (
              <AddSpentTimeForm
                workItem={work}
                onAdd={props.onUpdate}
              />
            )
          });
        }
      });
    }
    if (workPermissions.canDelete) {
      options.push({
        title: 'Delete',
        execute: () => {
          logEvent({
            message: 'SpentTime: actions:delete',
            analyticsId: ANALYTICS_ISSUE_STREAM_SECTION
          });
          if (props.onDelete) {
            props.onDelete(work);
          }
        }
      });
    }

    options.push({title: 'Cancel'});

    const selectedAction = await showActionSheet(options, showActionSheetWithOptions);
    if (selectedAction && selectedAction.execute) {
      selectedAction.execute();
    }
  }

};

export default React.memo<Props>(StreamWork);
