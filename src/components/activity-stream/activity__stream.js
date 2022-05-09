/* @flow */

import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

import ActivityUserAvatar from './activity__stream-avatar';
import ApiHelper from 'components/api/api__helper';
import Comment from 'components/comment/comment';
import CommentReactions from 'components/comment/comment-reactions';
import CommentVisibility from 'components/comment/comment__visibility';
import Feature, {FEATURE_VERSION} from '../feature/feature';
import IssueVisibility from 'components/visibility/issue-visibility';
import ReactionAddIcon from 'components/reactions/new-reaction.svg';
import StreamAttachments from './activity__stream-attachment';
import StreamHistoryAndRelatedChanges from './activity__stream-history';
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

  const renderUserInfo = (activityGroup: Object, noTimestamp?: boolean) => (
    <StreamUserInfo activityGroup={activityGroup} noTimestamp={noTimestamp}/>
  );

  const getCommentFromActivityGroup = (activityGroup: Object): IssueComment | null => (
    firstActivityChange(activityGroup.comment)
  );

  const onShowCommentActions = (activityGroup: Activity, comment: IssueComment): void => {
    if (props.commentActions?.onShowCommentActions) {
      props.commentActions.onShowCommentActions(comment, ((activityGroup.comment: any): IssueComment).id);
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
    const comment: IssueComment | null = getCommentFromActivityGroup(activityGroup);
    if (!comment) {
      return null;
    }

    const allAttachments = ApiHelper.convertAttachmentRelativeToAbsURLs(comment.attachments || [], props.youtrackWiki.backendUrl).concat(props.attachments || []);
    const commentActions: ?ActivityStreamCommentActions = props.commentActions;

    return (
      <View key={comment.id}>
        {!activityGroup.merged && renderUserInfo(activityGroup)}

        <View>

          <Comment
            attachments={allAttachments}
            canDeletePermanently={!!commentActions?.canDeleteCommentPermanently}
            canRestore={commentActions?.canRestoreComment ? commentActions.canRestoreComment(comment) : false}
            comment={comment}
            key={comment.id}
            onDeletePermanently={() => {
              if (commentActions?.onDeleteCommentPermanently) {
                commentActions.onDeleteCommentPermanently(comment, activityGroup.comment.id);
              }
            }}
            onRestore={() => { if (commentActions?.onRestoreComment) {commentActions.onRestoreComment(comment);} }}
            onLongPress={() => onShowCommentActions(activityGroup, comment)}
            uiTheme={props.uiTheme}
            youtrackWiki={props.youtrackWiki}
            onCheckboxUpdate={
              (checked: boolean, position: number) => (
                props.onCheckboxUpdate && comment && props.onCheckboxUpdate(checked, position, comment)
              )
            }
          />

          {!comment.deleted && (comment?.attachments || []).length > 0 && (
            <View
              style={styles.activityCommentAttachments}
            >
              <StreamAttachments attachments={comment.attachments}/>
            </View>
          )}

          {!comment.deleted && IssueVisibility.isSecured(comment.visibility) &&
          <CommentVisibility
            style={styles.activityVisibility}
            visibility={IssueVisibility.getVisibilityPresentation(comment.visibility)}
            color={props.uiTheme.colors.$iconAccent}
          />}
        </View>
      </View>
    );
  };

  return (
    <>
      {props.activities?.length > 0
        ? props.activities.map((activityGroup: Activity, index) => {
          if (activityGroup.hidden) {
            return null;
          }

          const isCommentActivity: boolean = !!activityGroup.comment;
          return (
            <View key={activityGroup.timestamp ? `${activityGroup.timestamp}_${index}` : guid()}>
              {index > 0 && !activityGroup.merged && <View style={styles.activitySeparator}/>}

              <View style={[
                styles.activity,
                activityGroup.merged ? styles.activityMerged : null,
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

                  <StreamHistoryAndRelatedChanges
                    activityGroup={activityGroup}
                    isRelatedChange={!!activityGroup.comment || !!activityGroup.work || !!activityGroup.vcs}
                    workTimeSettings={props.workTimeSettings}
                  />

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
