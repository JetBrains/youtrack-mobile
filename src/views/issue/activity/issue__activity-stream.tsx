import React, {useContext, useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import ApiHelper from 'components/api/api__helper';
import IssuePermissions from 'components/issue-permissions/issue-permissions';
import ReactionsPanel from './issue__activity-reactions-dialog';
import usage from 'components/usage/usage';
import {ActivityStream} from 'components/activity-stream/activity__stream';
import {ANALYTICS_ISSUE_STREAM_SECTION} from 'components/analytics/analytics-ids';
import {attachmentActions} from './issue-activity__attachment-actions-and-types';
import {createActivityCommentActions} from './issue-activity__comment-actions';
import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';
import {IssueContext} from '../issue-context';
import type {ActivityStreamProps} from 'components/activity-stream/activity__stream';
import type {Activity, ActivityStreamCommentActions} from 'types/Activity';
import type {AppState} from '../../../reducers';
import type {Attachment, IssueComment} from 'types/CustomFields';
import type {CustomError} from 'types/Error';
import type {IssueContextData, IssueFull} from 'types/Issue';
import type {Reaction} from 'types/Reaction';
type Props = ActivityStreamProps & {
  issueId: string;
  actionSheet: (...args: Array<any>) => any;
  headerRenderer: () => any;
  refreshControl: () => any;
  highlight?: {
    activityId: string;
    commentId?: string;
  };
};

const IssueActivityStream = (props: Props) => {
  const configBackendUrl: string = useSelector(
    (appState: AppState) => appState.app.auth?.config?.backendUrl || '',
  );
  const issueContext: IssueContextData = useContext(IssueContext);
  const commentActions = createActivityCommentActions();
  const [reactionState, setReactionState] = useState({
    isReactionsPanelVisible: false,
    currentComment: null,
  });
  const [activities, setActivities] = useState(null);
  useEffect(() => {
    setActivities(props.activities);
  }, [props.activities]);

  const selectReaction = (comment: IssueComment, reaction: Reaction) => {
    usage.trackEvent(ANALYTICS_ISSUE_STREAM_SECTION, 'Add reaction to comment');
    hideReactionsPanel();
    // $FlowFixMe
    return props.onReactionSelect(
      props.issueId,
      comment,
      reaction,
      props.activities,
      (activities: Array<Activity>, error: CustomError) => {
        if (!error) {
          setActivities(activities);
        }
      },
    );
  };

  const hideReactionsPanel = (): void =>
    setReactionState({
      isReactionsPanelVisible: false,
      currentComment: null,
    });

  const createCommentActions = (): ActivityStreamCommentActions => {
    const issue: IssueFull = issueContext.issue;
    const issuePermissions: IssuePermissions = issueContext.issuePermissions;
    const dispatch: (...args: Array<any>) => any = issueContext.dispatcher;

    const canUpdateComment = (comment: IssueComment): boolean =>
      issuePermissions.canUpdateComment(issue, comment);

    const canDeleteComment = (comment: IssueComment): boolean =>
      issuePermissions.canDeleteComment(issue, comment);

    const onDeleteAttachment = async (
      attachment: Attachment,
    ): Promise<void> => {
      await dispatch(attachmentActions.removeAttachment(attachment, issue.id));
    };

    const canDeleteCommentAttachment = (attachment: Attachment) =>
      issuePermissions.canDeleteCommentAttachment(attachment, issue);

    const onEditComment = (comment: IssueComment): void => {
      if (comment.attachments && configBackendUrl) {
        comment.attachments = ApiHelper.convertAttachmentRelativeToAbsURLs(
          comment.attachments,
          configBackendUrl,
        );
      }

      usage.trackEvent(ANALYTICS_ISSUE_STREAM_SECTION, 'Edit comment');
      dispatch(commentActions.setEditingComment({...comment, isEdit: true}));
    };

    return {
      canCommentOn: issuePermissions.canCommentOn(issue),
      canUpdateComment: canUpdateComment,
      canDeleteComment: canDeleteComment,
      canDeleteCommentAttachment: canDeleteCommentAttachment,
      canDeleteCommentPermanently: issuePermissions.canDeleteCommentPermanently(
        issue,
      ),
      canRestoreComment: (comment: IssueComment) =>
        issuePermissions.canRestoreComment(issue, comment),
      onReply: (comment: IssueComment) => {
        dispatch(
          commentActions.setEditingComment({
            reply: true,
            text: `> ${comment.text ? `${comment.text}\n\n` : ''}@${
              comment?.author?.login || getEntityPresentation(comment?.author)
            } `,
          }),
        );
      },
      isAuthor: (comment: IssueComment) =>
        issuePermissions.isCurrentUser(comment?.author),
      onCopyCommentLink: (comment: IssueComment) =>
        dispatch(commentActions.copyCommentUrl(comment)),
      onDeleteCommentPermanently: (
        comment: IssueComment,
        activityId?: string,
      ) =>
        dispatch(commentActions.deleteCommentPermanently(comment, activityId)),
      onDeleteAttachment: onDeleteAttachment,
      onDeleteComment: (comment: IssueComment) =>
        dispatch(commentActions.deleteComment(comment)),
      onRestoreComment: (comment: IssueComment) =>
        dispatch(commentActions.restoreComment(comment)),
      onStartEditing: onEditComment,
      onShowCommentActions: (comment: IssueComment) =>
        dispatch(
          commentActions.showIssueCommentActions(
            props.actionSheet(),
            comment,
            canUpdateComment(comment) ? onEditComment : null,
            canDeleteComment(comment),
          ),
        ),
    };
  };

  return (
    <>
      <IssueStream
        {...props}
        commentActions={createCommentActions()}
        activities={activities}
        onReactionPanelOpen={(comment: IssueComment) => {
          setReactionState({
            isReactionsPanelVisible: true,
            currentComment: comment,
          });
        }}
        onSelectReaction={selectReaction}
        onCheckboxUpdate={(
          checked: boolean,
          position: number,
          comment: IssueComment,
        ) =>
          props.onCheckboxUpdate &&
          props.onCheckboxUpdate(checked, position, comment)
        }
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

export const IssueStream: React$AbstractComponent<
  ActivityStreamProps,
  unknown
> = React.memo<ActivityStreamProps>(ActivityStream, isActivitiesEqual);
export default React.memo<Props>(
  IssueActivityStream,
  isActivitiesEqual,
) as React$AbstractComponent<Props, unknown>;
