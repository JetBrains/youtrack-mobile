/* @flow */

import React, {useContext} from 'react';
import {View} from 'react-native';

import Comment from 'components/comment/comment';
import CommentVisibility from 'components/comment/comment__visibility';
import IssueVisibility from 'components/visibility/issue-visibility';
import StreamAttachments from './activity__stream-attachment';
import {firstActivityChange} from './activity__stream-helper';
import {ThemeContext} from '../theme/theme-context';

import styles from './activity__stream.styles';

import type {Activity, ActivityStreamCommentActions} from 'flow/Activity';
import type {Attachment, IssueComment} from 'flow/CustomFields';
import type {Node} from 'react';
import type {Theme} from 'flow/Theme';
import type {YouTrackWiki} from 'flow/Wiki';


interface Props {
  activity: Activity,
  attachments?: Array<Attachment>;
  commentActions?: ActivityStreamCommentActions;
  hideVisibility?: boolean;
  youtrackWiki?: YouTrackWiki;
  onCheckboxUpdate?: (checked: boolean, position: number, comment: IssueComment) => any;
  onShowCommentActions?: (comment: IssueComment) => any;
}

const StreamComment = ({
  activity,
  attachments = [],
  commentActions,
  hideVisibility,
  onCheckboxUpdate,
  onShowCommentActions = () => {},
  youtrackWiki,
}: Props): Node => {
  const theme: Theme = useContext(ThemeContext);

  const comment: ?IssueComment = firstActivityChange(activity);
  if (!comment) {
    return null;
  }

  const commentAttachments: Attachment[] = comment?.attachments || [];
  return (
    <>
      <Comment
        attachments={attachments}
        canDeletePermanently={!!commentActions?.canDeleteCommentPermanently}
        canRestore={commentActions?.canRestoreComment ? commentActions.canRestoreComment(comment) : false}
        comment={comment}
        key={comment.id}
        onDeletePermanently={() => {
          if (commentActions?.onDeleteCommentPermanently) {
            commentActions.onDeleteCommentPermanently(comment, activity.id);
          }
        }}
        onRestore={() => {
          if (commentActions?.onRestoreComment) {
            commentActions.onRestoreComment(comment);
          }
        }}
        onLongPress={() => onShowCommentActions(comment)}
        uiTheme={theme.uiTheme}
        youtrackWiki={youtrackWiki}
        onCheckboxUpdate={
          (checked: boolean, position: number) => (
            onCheckboxUpdate && comment && onCheckboxUpdate(checked, position, comment)
          )
        }
      />

      {!comment.deleted && commentAttachments.length > 0 && (
        <View
          style={styles.activityCommentAttachments}
        >
          <StreamAttachments attachments={commentAttachments}/>
        </View>
      )}

      {!hideVisibility && !comment.deleted && IssueVisibility.isSecured(comment.visibility) &&
        <CommentVisibility
          style={styles.activityVisibility}
          visibility={IssueVisibility.getVisibilityPresentation(comment.visibility)}
          color={theme.uiTheme.colors.$iconAccent}
        />}
    </>
  );
};


export default StreamComment;
