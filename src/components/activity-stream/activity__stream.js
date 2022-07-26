/* @flow */

import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

import ActivityUserAvatar from './activity__stream-avatar';
import ApiHelper from '../api/api__helper';
import CommentReactions from 'components/comment/comment-reactions';
import Feature, {FEATURE_VERSION} from '../feature/feature';
import ReactionAddIcon from 'components/reactions/new-reaction.svg';
import StreamComment from './activity__stream-comment';
import StreamHistoryChange from './activity__stream-history';
import StreamTimestamp from './activity__stream-timestamp';
import StreamUserInfo from './activity__stream-user-info';
import StreamVCS from './activity__stream-vcs';
import StreamWork from './activity__stream-work';
import {firstActivityChange} from './activity__stream-helper';
import {guid, isIOSPlatform} from 'util/util';
import {HIT_SLOP} from 'components/common-styles/button';
import {i18n} from 'components/i18n/i18n';
import {IconDrag, IconMoreOptions} from 'components/icon/icon';

import styles from './activity__stream.styles';

import type {
  Activity,
  ActivityItem,
  ActivityStreamCommentActions,
} from 'flow/Activity';
import type {Attachment, IssueComment} from 'flow/CustomFields';
import type {CustomError} from 'flow/Error';
import type {Node} from 'react';
import type {Reaction} from 'flow/Reaction';
import type {UITheme} from 'flow/Theme';
import type {User} from 'flow/User';
import type {WorkItem, WorkTimeSettings} from 'flow/Work';
import type {YouTrackWiki} from 'flow/Wiki';


type Props = {
  activities: Array<Activity> | null,
  attachments: Array<Attachment>,
  commentActions?: ActivityStreamCommentActions,
  currentUser: User,
  issueFields?: Array<Object>,
  onReactionSelect: (
    issueId: string,
    comment: IssueComment,
    reaction: Reaction,
    activities: Array<ActivityItem>,
    onReactionUpdate: (activities: Array<ActivityItem>, error?: CustomError) => void
  ) => any,
  uiTheme: UITheme,
  workTimeSettings: ?WorkTimeSettings,
  youtrackWiki: YouTrackWiki,
  onWorkDelete?: (workItem: WorkItem) => any,
  onWorkUpdate?: (workItem?: WorkItem) => void,
  onWorkEdit?: (workItem: WorkItem) => void,
  onCheckboxUpdate?: (checked: boolean, position: number, comment: IssueComment) => Function,
};

export type ActivityStreamPropsReaction = {
  onReactionPanelOpen?: (comment: IssueComment) => void,
  onSelectReaction?: (comment: IssueComment, reaction: Reaction) => void
}

export type ActivityStreamProps = {
  ...Props,
  ...ActivityStreamPropsReaction,
}

export const ActivityStream = (props: ActivityStreamProps): Node => {

  const getCommentFromActivityGroup = (activityGroup: Object): IssueComment | null => (
    firstActivityChange(activityGroup.comment)
  );

  const onShowCommentActions = (activityGroup: Activity, comment: IssueComment): void => {
    if (props.commentActions?.onShowCommentActions) {
      props.commentActions.onShowCommentActions(comment, activityGroup.comment.id);
    }
  };

  const renderCommentActions = (activityGroup: Object) => {
    const comment: IssueComment | null = getCommentFromActivityGroup(activityGroup);
    if (!comment) {
      return null;
    }

    const commentActions = props.commentActions;
    const isAuthor = commentActions && commentActions.isAuthor && commentActions.isAuthor(comment);

    const canComment: boolean = !!commentActions?.canCommentOn;
    const canUpdate: boolean = !!commentActions && !!commentActions.canUpdateComment && commentActions.canUpdateComment(comment);

    if (!comment.deleted) {
      // $FlowFixMe
      const reactionAddIcon: string = <ReactionAddIcon style={styles.activityCommentActionsAddReaction}/>;
      return (
        <View style={styles.activityCommentActions}>
          <View style={styles.activityCommentActionsMain}>
            {canComment && !isAuthor && (
              <TouchableOpacity
                hitSlop={HIT_SLOP}
                onPress={() => {
                  if (commentActions && commentActions.onReply) {
                    commentActions.onReply(comment);
                  }
                }}>
                <Text style={styles.link}>
                  Reply
                </Text>
              </TouchableOpacity>
            )}
            {canUpdate && isAuthor && (
              <TouchableOpacity
                hitSlop={HIT_SLOP}
                onPress={() => {
                  if (commentActions && commentActions.onStartEditing) {
                    commentActions.onStartEditing(comment);
                  }
                }}>
                <Text style={styles.link}>
                  {i18n('Edit')}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {!!props.onReactionPanelOpen && <Feature version={FEATURE_VERSION.reactions}>
            <TouchableOpacity
              hitSlop={HIT_SLOP}
              onPress={() => {if (props.onReactionPanelOpen) {props.onReactionPanelOpen(comment);}}}
            >
              {reactionAddIcon}
            </TouchableOpacity>
          </Feature>}

          {Boolean(commentActions && commentActions.onShowCommentActions) && <TouchableOpacity
            hitSlop={HIT_SLOP}
            onPress={() => onShowCommentActions(activityGroup, comment)}>
            {isIOSPlatform()
              ? <IconMoreOptions size={18} color={styles.activityCommentActionsOther.color}/>
              : <IconDrag size={18} color={styles.activityCommentActionsOther.color}/>}
          </TouchableOpacity>}
        </View>
      );
    }
  };

  const renderCommentActivityReactions = (activityGroup: Object) => {
    const comment: IssueComment | null = getCommentFromActivityGroup(activityGroup);
    if (!comment || comment.deleted) {
      return null;
    }
    return <CommentReactions
      style={styles.commentReactions}
      comment={comment}
      currentUser={props.currentUser}
      onReactionSelect={props.onSelectReaction}
    />;
  };

  const renderCommentActivity = (activityGroup: Object) => {
    const activity: ?Activity = activityGroup.comment;
    const commentAttachments = (firstActivityChange(activity) || {}).attachmets || [];
    const allAttachments: Array<Attachment> = ApiHelper.convertAttachmentRelativeToAbsURLs(
      commentAttachments,
      props.youtrackWiki.backendUrl
    ).concat(props.attachments || []);

    return <>
      {activityGroup.merged
        ? <StreamTimestamp timestamp={activityGroup.timestamp} style={styles.activityCommentDate}/>
        : <StreamUserInfo activityGroup={activityGroup}/>}
      <StreamComment
        activity={activity}
        attachments={allAttachments}
        commentActions={props.commentActions}
        onShowCommentActions={(comment: IssueComment) => {
          if (props.commentActions?.onShowCommentActions) {
            props.commentActions.onShowCommentActions(comment, activity.id);
          }
        }}
        youtrackWiki={props.youtrackWiki}
      />
    </>;

  };

  return (
    <>
      {props.activities?.length > 0
        ? props.activities.map((activityGroup: Activity, index) => {
          if (activityGroup.hidden) {
            return null;
          }

          const isCommentActivity: boolean = !!activityGroup.comment;
          const isRelatedChange: boolean = !!activityGroup.comment || !!activityGroup.work || !!activityGroup.vcs;
          return (
            <View key={activityGroup.timestamp ? `${activityGroup.timestamp}_${index}` : guid()}>
              {index > 0 && !activityGroup.merged && <View style={styles.activitySeparator}/>}

              <View style={[
                styles.activity,
                activityGroup.merged && !activityGroup.comment ? styles.activityMerged : null,
              ]}>

                <ActivityUserAvatar
                  activityGroup={activityGroup}
                  showAvatar={!!activityGroup.comment}
                />

                <View style={styles.activityItem}>
                  {isCommentActivity && renderCommentActivity(activityGroup)}

                  {activityGroup.work && (
                    <StreamWork
                      activityGroup={activityGroup}
                      onDelete={props.onWorkDelete}
                      onUpdate={props.onWorkUpdate}
                      onEdit={props.onWorkEdit}
                    />)
                  }

                  {activityGroup.vcs && <StreamVCS activityGroup={activityGroup}/>}

                  {activityGroup?.events?.length > 0 && (
                    <View style={isRelatedChange ? styles.activityRelatedChanges : styles.activityHistoryChanges}>
                      {Boolean(!activityGroup.merged && !isRelatedChange) && <StreamUserInfo activityGroup={activityGroup}/>}
                      {activityGroup.merged && <StreamTimestamp timestamp={activityGroup.timestamp}/>}

                      {activityGroup.events.map(
                        (event) => (
                          <StreamHistoryChange
                            key={event.id}
                            activity={event}
                            workTimeSettings={props.workTimeSettings}/>
                        )
                      )}
                    </View>
                  )}

                  {isCommentActivity && !!props.onSelectReaction && renderCommentActivityReactions(activityGroup)}
                  {isCommentActivity && renderCommentActions(activityGroup)}
                </View>

              </View>
            </View>
          );
        })
        : !!props.activities && <Text style={styles.activityNoActivity}>{i18n('No activity yet')}</Text>
      }
    </>
  );
};
