import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {useActionSheet} from '@expo/react-native-action-sheet';
import {useSelector} from 'react-redux';
import IssuePermissions from '../issue-permissions/issue-permissions';
import MarkdownView from '../wiki/markdown-view';
import StreamUserInfo from './activity__stream-user-info';
import {ANALYTICS_ISSUE_STREAM_SECTION} from '../analytics/analytics-ids';
import {
  firstActivityChange,
  getDurationPresentation,
} from './activity__stream-helper';
import {HIT_SLOP} from '../common-styles/button';
import {i18n} from 'components/i18n/i18n';
import {IconContextActions} from '../icon/icon';
import {logEvent} from '../log/log-helper';
import {markdownText} from '../common-styles/typography';
import {showActionSheet} from '../action-sheet/action-sheet';
import {ytDate} from 'components/date/date';
import styles from './activity__stream.styles';
import type {ActionSheetOption} from '../action-sheet/action-sheet';
import type {Activity} from 'types/Activity';
import type {AppState} from '../../reducers';
import type {IssueFull} from 'types/Issue';
import type {WorkItem} from 'types/Work';
type Props = {
  activityGroup: Activity;
  onDelete?: (workItem: WorkItem) => any;
  onUpdate?: (workItem?: WorkItem) => any;
  onEdit?: (workItem: WorkItem) => any;
};
type WorkPermissions = {
  canUpdate: boolean;
  canDelete: boolean;
  canCreateNotOwn: boolean;
};

const StreamWork = (props: Props) => {
  const issuePermissions: IssuePermissions = useSelector(
    (state: AppState) => state.app.issuePermissions,
  );
  const issue: IssueFull = useSelector(
    (state: AppState) => state.issueState.issue,
  );
  const {showActionSheetWithOptions} = useActionSheet();
  const work: WorkItem | null | undefined = firstActivityChange(
    props.activityGroup.work,
  );

  if (!work) {
    return null;
  }

  const workPermissions: WorkPermissions = canChangeWork(work);
  return (
    <View>
      {!props.activityGroup.merged && props.activityGroup.author && (
        <StreamUserInfo activityGroup={props.activityGroup} />
      )}

      <View style={styles.activityChange}>
        {Boolean(work.date) && (
          <Text style={styles.secondaryTextColor}>
            {ytDate(work.date, true)}
          </Text>
        )}

        <View style={styles.activityWork}>
          <Text style={styles.activityLabel}>{i18n('Spent time:')}</Text>
          <Text style={styles.activityWorkTime}>
            {getDurationPresentation(work.duration)}
          </Text>
          {work.type && (
            <Text
              style={styles.secondaryTextColor}
            >{`, ${work.type.name}`}</Text>
          )}
          {work.id && (workPermissions.canUpdate || workPermissions.canDelete) && (
            <TouchableOpacity
              hitSlop={HIT_SLOP}
              style={styles.activityWorkEditIcon}
              onPress={showContextActions}
            >
              <IconContextActions
                size={18}
                color={styles.activityCommentActionsAddReaction.color}
              />
            </TouchableOpacity>
          )}
        </View>

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
  );

  function canChangeWork(workItem: WorkItem): WorkPermissions {
    const canUpdate: boolean = issuePermissions.canUpdateWork(issue, workItem);
    const canDelete: boolean = issuePermissions.canDeleteWork(issue, workItem);
    const canCreateNotOwn: boolean = issuePermissions.canCreateWorkNotOwn(
      issue,
    );
    return {
      ...{
        canUpdate,
      },
      ...{
        canDelete,
      },
      ...{
        canCreateNotOwn,
      },
    };
  }

  async function showContextActions() {
    const options: Array<ActionSheetOption> = [];

    if (workPermissions.canUpdate) {
      options.push({
        title: i18n('Edit'),
        execute: () => props?.onEdit && props.onEdit(work),
      });
    }

    if (workPermissions.canDelete) {
      options.push({
        title: i18n('Delete'),
        execute: () => {
          logEvent({
            message: 'SpentTime: actions:delete',
            analyticsId: ANALYTICS_ISSUE_STREAM_SECTION,
          });

          if (props.onDelete) {
            props.onDelete(work);
          }
        },
      });
    }

    options.push({
      title: i18n('Cancel'),
    });
    const selectedAction = await showActionSheet(
      options,
      showActionSheetWithOptions,
    );

    if (selectedAction && selectedAction.execute) {
      selectedAction.execute();
    }
  }
};

export default React.memo<Props>(StreamWork) as React$AbstractComponent<
  Props,
  unknown
>;
