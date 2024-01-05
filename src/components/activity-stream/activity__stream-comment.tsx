import React, {useContext} from 'react';
import {View} from 'react-native';
import Comment from 'components/comment/comment';
import CommentVisibility from 'components/comment/comment__visibility';
import IssueVisibility from 'components/visibility/issue-visibility';
import StreamAttachments from './activity__stream-attachment';
import {firstActivityChange} from './activity__stream-helper';
import {ThemeContext} from '../theme/theme-context';
import styles from './activity__stream.styles';
import type {Activity, ActivityStreamCommentActions} from 'types/Activity';
import type {Attachment, IssueComment} from 'types/CustomFields';
import type {Theme} from 'types/Theme';
import type {YouTrackWiki} from 'types/Wiki';
type Props = {
  activity: Activity;
  attachments?: Attachment[];
  commentActions: ActivityStreamCommentActions;
  hideVisibility?: boolean;
  youtrackWiki?: YouTrackWiki;
  onCheckboxUpdate?: (
    checked: boolean,
    position: number,
    comment: IssueComment,
  ) => any;
  onLongPress?: (comment: IssueComment) => any;
};

const StreamComment = ({
  activity,
  attachments = [],
  commentActions,
  hideVisibility,
  onCheckboxUpdate,
  onLongPress = () => {},
  youtrackWiki,
}: Props): JSX.Element | null => {
  const theme: Theme = useContext(ThemeContext);
  const comment: IssueComment | null = firstActivityChange(
    activity,
  ) as IssueComment | null;

  if (!comment) {
    return null;
  }

  const commentAttachments: Attachment[] = comment?.attachments || [];
  return (
    <>
      <Comment
        attachments={attachments}
        canDeletePermanently={!!commentActions?.canDeleteCommentPermanently}
        canRestore={
          commentActions?.canRestoreComment
            ? commentActions.canRestoreComment(comment)
            : false
        }
        comment={comment}
        key={comment.id}
        onDeletePermanently={() => commentActions?.onDeleteCommentPermanently?.(comment, activity.id)}
        onRestore={() => commentActions?.onRestoreComment?.(comment)}
        onLongPress={() => onLongPress(comment)}
        uiTheme={theme.uiTheme}
        youtrackWiki={youtrackWiki}
        onCheckboxUpdate={(checked: boolean, position: number) =>
          onCheckboxUpdate &&
          comment &&
          onCheckboxUpdate(checked, position, comment)
        }
      />

      {!comment.deleted && commentAttachments.length > 0 && (
        <View style={styles.activityCommentAttachments}>
          <StreamAttachments attachments={commentAttachments} />
        </View>
      )}

      {!hideVisibility &&
        !comment.deleted &&
        IssueVisibility.isSecured(comment.visibility) && (
          <CommentVisibility
            style={styles.activityVisibility}
            presentation={IssueVisibility.getVisibilityPresentation(comment.visibility)}
            color={theme.uiTheme.colors.$iconAccent}
          />
        )}
    </>
  );
};

export default StreamComment;
