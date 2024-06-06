import React, {useContext, useEffect, useState} from 'react';
import {Clipboard, Share} from 'react-native';

import {useSelector} from 'react-redux';

import ApiHelper from 'components/api/api__helper';
import CommentVisibilityControl from 'components/visibility/comment-visibility-control';
import IssuePermissions from 'components/issue-permissions/issue-permissions';
import ReactionsPanel from './issue__activity-reactions-dialog';
import usage from 'components/usage/usage';
import ActivityStream from 'components/activity-stream/activity__stream';
import useIsReporter from 'components/user/useIsReporter';
import {ANALYTICS_ISSUE_STREAM_SECTION} from 'components/analytics/analytics-ids';
import {attachmentActions} from './issue-activity__attachment-actions-and-types';
import {createActivityCommentActions} from './issue-activity__comment-actions';
import {getApi} from 'components/api/api__instance';
import {getReplyToText} from 'components/activity/activity-helper';
import {guid} from 'util/util';
import {i18n} from 'components/i18n/i18n';
import {IssueContext} from '../issue-context';
import {logEvent} from 'components/log/log-helper';
import {makeIssueWebUrl} from 'views/issue/activity/issue-activity__helper';
import {notify} from 'components/notification/notification';

import type {Activity, ActivityStreamCommentActions} from 'types/Activity';
import type {ActivityStreamProps} from 'components/activity-stream/activity__stream';
import type {AppState} from 'reducers';
import type {Attachment, IssueComment} from 'types/CustomFields';
import type {ContextMenuConfig, ContextMenuConfigItem} from 'types/MenuConfig';
import type {CustomError} from 'types/Error';
import type {Entity} from 'types/Entity';
import type {IssueContextData, IssueFull} from 'types/Issue';
import type {Reaction} from 'types/Reaction';

type Props = ActivityStreamProps & {
  issueId: string;
  actionSheet: (...args: any[]) => any;
  refreshControl: () => any;
  highlight?: {
    activityId: string;
    commentId?: string;
  };
};

interface IReactionState {
  isReactionsPanelVisible: boolean;
  currentComment: IssueComment | null;
}

const IssueActivityStream: React.FC<Props> = (props: Props) => {
  const configBackendUrl: string = useSelector((appState: AppState) => appState.app.auth?.config?.backendUrl || '');
  const issueContext: IssueContextData = useContext(IssueContext);
  const commentActions = createActivityCommentActions();
  const isReporter = useIsReporter();

  const [reactionState, setReactionState] = useState<IReactionState>({
    currentComment: null,
    isReactionsPanelVisible: false,
  });

  const [activities, setActivities] = useState<Activity[] | null>(null);

  const [selectedComment, setSelectedComment] = useState<IssueComment | null>(null);

  useEffect(() => {
    setActivities(props.activities);
  }, [props.activities]);

  const selectReaction = (comment: IssueComment, reaction: Reaction) => {
    usage.trackEvent(ANALYTICS_ISSUE_STREAM_SECTION, 'Add reaction to comment');
    hideReactionsPanel();
    props.onReactionSelect(
      props.issueId,
      comment,
      reaction,
      activities,
      (updatedActivities: Activity[], error: CustomError) => {
        if (!error) {
          setActivities(updatedActivities);
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
    const dispatch: (...args: any[]) => any = issueContext.dispatcher;
    const createContextMenuConfig = (comment: IssueComment, activityId?: string): ContextMenuConfig => {
      return {
        menuTitle: '',
        menuItems: comment.deleted ? [] : [
          (issuePermissions.canUpdateComment(issue, comment) && {
            actionKey: guid(),
            actionTitle: i18n('Edit'),
            execute: () => {
              usage.trackEvent(ANALYTICS_ISSUE_STREAM_SECTION, 'Edit comment');
              if (comment.attachments && configBackendUrl) {
                comment.attachments = ApiHelper.convertAttachmentRelativeToAbsURLs(
                  comment.attachments,
                  configBackendUrl,
                );
              }
              dispatch(commentActions.setEditingComment({...comment, isEdit: true}));
            },
          }),
          (issuePermissions.canCommentOn(issue) && !issuePermissions.isCurrentUser(comment?.author) && {
            actionKey: guid(),
            actionTitle: i18n('Reply'),
            execute: () => {
              usage.trackEvent(ANALYTICS_ISSUE_STREAM_SECTION, 'Reply to comment');
              dispatch(commentActions.setEditingComment(getReplyToText(comment.text, comment.author)));
            },
          }),
          {
            actionKey: guid(),
            actionTitle: i18n('Add reaction'),
            execute: () => {
              usage.trackEvent(ANALYTICS_ISSUE_STREAM_SECTION, 'Add reaction to comment');
              setReactionState({
                isReactionsPanelVisible: true,
                currentComment: comment,
              });
            },
          },
          issuePermissions.canUpdateCommentVisibility(issue) && {
            actionKey: guid(),
            actionTitle: i18n('Update visibility'),
            execute: () => {
              usage.trackEvent(ANALYTICS_ISSUE_STREAM_SECTION, 'Change visibility');
              setSelectedComment(comment);
            },
          },
          {
            actionKey: guid(),
            actionTitle: i18n('Copy text'),
            execute: () => {
              Clipboard.setString(comment.text);
              usage.trackEvent(ANALYTICS_ISSUE_STREAM_SECTION, 'Copy comment text');
              notify(i18n('Copied'));
            },
            startBlock: true,
          },
          {
            actionKey: guid(),
            actionTitle: i18n('Copy link'),
            execute: () => {
              if (activityId) {
                dispatch(commentActions.copyCommentUrl(activityId));
              }
              usage.trackEvent(ANALYTICS_ISSUE_STREAM_SECTION, 'Copy comment URL');
            },
          },
          (!!activityId && {
            actionKey: guid(),
            actionTitle: i18n('Share link'),
            execute: () => {
              const url: string = makeIssueWebUrl(getApi(), issue, activityId);
              Share.share({
                url,
                message: url,
              }, {
                dialogTitle: i18n('Share link'),
              });
              logEvent({
                message: 'Share article',
                analyticsId: ANALYTICS_ISSUE_STREAM_SECTION,
              });
            },
          }),
          (issuePermissions.canDeleteComment(issue, comment) && {
            actionKey: guid(),
            actionTitle: i18n('Delete'),
            menuAttributes: ['destructive'],
            execute: () => {
              usage.trackEvent(ANALYTICS_ISSUE_STREAM_SECTION, 'Delete comment');
              dispatch(commentActions.deleteComment(comment));
            },
            startBlock: true,
          }),
        ].filter(Boolean) as ContextMenuConfigItem[],
      };
    };

    return {
      canDeleteCommentAttachment: (attachment: Attachment) => issuePermissions.canDeleteCommentAttachment(attachment, issue),
      canDeleteCommentPermanently: issuePermissions.canDeleteCommentPermanently(issue),
      canRestoreComment: (comment: IssueComment) => issuePermissions.canRestoreComment(issue, comment),
      onDeleteCommentPermanently: (comment: IssueComment, activityId?: string) => {
        dispatch(commentActions.deleteCommentPermanently(comment, activityId));
      },
      onDeleteAttachment: async (attachment: Attachment): Promise<void> => {
        await dispatch(attachmentActions.removeAttachment(attachment, issue.id));
      },
      onDeleteComment: (comment: IssueComment) => {
        dispatch(commentActions.deleteComment(comment));
      },
      onRestoreComment: (comment: IssueComment) => {
        dispatch(commentActions.restoreComment(comment));
      },
      contextMenuConfig: (comment: IssueComment, activityId?: string) => createContextMenuConfig(comment, activityId),
    };
  };

  return (
    <>
      <IssueStream
        {...props}
        isReporter={isReporter}
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
            selectReaction(reactionState.currentComment as IssueComment, reaction);
          }}
          onHide={hideReactionsPanel}
        />
      )}
      {!!selectedComment && (
        <CommentVisibilityControl
          forceChange
          commentId={selectedComment.id}
          entity={selectedComment.issue as Entity}
          onUpdate={() => {
            setSelectedComment(null);
            props.onUpdate();
          }}
          visibility={selectedComment.visibility!}
        />
      )}
    </>
  );
};

const isActivitiesEqual = (prev: Props, next: Props): boolean => (
  !!prev && !!next && prev.activities === next.activities
);

export const IssueStream = React.memo<Props>(ActivityStream, isActivitiesEqual);

export default React.memo<Props>(IssueActivityStream, isActivitiesEqual);
