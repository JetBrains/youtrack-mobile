/* @flow */

import React, {useContext, useEffect, useState} from 'react';

import * as commentActions from './issue-activity__comment-actions';
import CommentEdit from '../../../components/comment/comment-edit';
import IssuePermissions from '../../../components/issue-permissions/issue-permissions';
import ReactionsPanel from './issue__activity-reactions-dialog';
import Router from '../../../components/router/router';
import usage from '../../../components/usage/usage';
import {ActivityStream} from '../../../components/activity-stream/activity__stream';
import {ANALYTICS_ISSUE_STREAM_SECTION} from '../../../components/analytics/analytics-ids';
import {attachmentActions} from './issue-activity__attachment-actions-and-types';
import {getEntityPresentation} from '../../../components/issue-formatter/issue-formatter';
import {IssueContext} from '../issue-context';
import {SkeletonIssueActivities} from '../../../components/skeleton/skeleton';

import type {
  ActivityStreamProps,
  ActivityStreamPropsReaction
} from '../../../components/activity-stream/activity__stream';
import type {Attachment, IssueComment} from '../../../flow/CustomFields';
import type {IssueContextData, IssueFull} from '../../../flow/Issue';
import type {Reaction} from '../../../flow/Reaction';
import type {ActivityStreamCommentActions} from '../../../flow/Activity';

type Props = ActivityStreamProps & {
  issueId: string,
  actionSheet: Function
};


const IssueActivityStream = (props: Props) => {
  const issueContext: IssueContextData = useContext(IssueContext);

  const [reactionState, setReactionState] = useState({
    isReactionsPanelVisible: false,
    currentComment: null
  });

  const [activities, setActivities] = useState(null);
  useEffect(() => {
    setActivities(props.activities);
  });

  const selectReaction = (comment: IssueComment, reaction: Reaction) => {
    usage.trackEvent(ANALYTICS_ISSUE_STREAM_SECTION, 'Add reaction to comment');
    hideReactionsPanel();
    // $FlowFixMe
    return props.onReactionSelect(props.issueId, comment, reaction, props.activities, (activities, error) => {
      if (!error) {
        setActivities(activities);
      }
    });
  };

  const hideReactionsPanel = (): void => setReactionState({isReactionsPanelVisible: false, currentComment: null});

  const createCommentActions = (): ActivityStreamCommentActions => {
    const issue: IssueFull = issueContext.issue;
    const issuePermissions: IssuePermissions = issueContext.issuePermissions;
    const dispatch: Function = issueContext.dispatcher;
    const canUpdateComment = (comment: IssueComment): boolean => issuePermissions.canUpdateComment(issue, comment);
    const canDeleteComment = (comment: IssueComment): boolean => issuePermissions.canDeleteComment(issue, comment);
    const onEditComment = (comment: Comment): void => {
      usage.trackEvent(ANALYTICS_ISSUE_STREAM_SECTION, 'Edit comment');
      Router.PageModal({
        children: (
          <CommentEdit
            comment={comment}
            onUpdate={(comment: IssueComment) => dispatch(commentActions.submitEditedComment(comment))}
            visibilityOptionsGetter={() => dispatch(commentActions.getCommentVisibilityOptions())}
          />
        )
      });
    };
    return {
      canCommentOn: issuePermissions.canCommentOn(issue),
      canUpdateComment: canUpdateComment,
      canDeleteComment: canDeleteComment,
      canDeleteCommentAttachment: (attachment: Attachment) => (
        issuePermissions.canDeleteCommentAttachment(attachment, issue)
      ),
      canDeleteCommentPermanently: issuePermissions.canDeleteCommentPermanently(issue),
      canRestoreComment: (comment: IssueComment) => issuePermissions.canRestoreComment(issue, comment),
      onReply: (comment: IssueComment) => {
        usage.trackEvent(ANALYTICS_ISSUE_STREAM_SECTION, 'Reply on comment');
        dispatch(commentActions.setEditingComment({
          reply: true,
          text: `@${comment?.author?.login || getEntityPresentation(comment?.author)} `,
        }));
      },
      isAuthor: (comment: IssueComment) => issuePermissions.isCurrentUser(comment?.author),
      onCopyCommentLink: (comment: IssueComment) => dispatch(commentActions.copyCommentUrl(comment)),
      onDeleteCommentPermanently: (comment: IssueComment, activityId?: string) => dispatch(
        commentActions.deleteCommentPermanently(comment, activityId)
      ),
      onDeleteAttachment: async (attachment: Attachment) => {
        await dispatch(attachmentActions.removeAttachment(attachment, issue.id));
        dispatch(commentActions.loadActivity(true));
      },
      onDeleteComment: (comment: IssueComment) => dispatch(commentActions.deleteComment(comment)),
      onRestoreComment: (comment: IssueComment) => dispatch(commentActions.restoreComment(comment)),
      onStartEditing: onEditComment,
      onShowCommentActions: (comment: IssueComment) => dispatch(commentActions.showIssueCommentActions(
        props.actionSheet(),
        comment,
        canUpdateComment(comment) ? onEditComment : null,
        canDeleteComment(comment)
      )),
    };
  };

  if (!props.activities) {
    return <SkeletonIssueActivities/>;
  }
  return (
    <>
      <IssueStream
        {...props}
        commentActions={createCommentActions()}
        activities={activities}
        onReactionPanelOpen={(comment: IssueComment) => {
          setReactionState({
            isReactionsPanelVisible: true,
            currentComment: comment
          });
        }}
        onSelectReaction={selectReaction}
        onCheckboxUpdate={(checked: boolean, position: number, comment: IssueComment) => (
          props.onCheckboxUpdate && props.onCheckboxUpdate(checked, position, comment)
        )}
      />

      {reactionState.isReactionsPanelVisible && (
        <ReactionsPanel
          onSelect={(reaction: Reaction) => {
            selectReaction(reactionState.currentComment, reaction);
          }}
          onHide={hideReactionsPanel}
        />
      )}
    </>
  );
};

const isActivitiesEqual = (prev, next): boolean => {
  return !!prev && !!next && prev.activities === next.activities;
};

export const IssueStream = React.memo<ActivityStreamProps & ActivityStreamPropsReaction>(
  ActivityStream, isActivitiesEqual
);
export default React.memo<Props>(IssueActivityStream, isActivitiesEqual);

