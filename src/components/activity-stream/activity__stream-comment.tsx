import React, {useContext} from 'react';
import {View} from 'react-native';

import Comment from 'components/comment/comment';
import StreamAttachments from './activity__stream-attachment';
import {firstActivityChange} from './activity__stream-helper';
import {ThemeContext} from 'components/theme/theme-context';

import styles from './activity__stream.styles';

import type {Activity, ActivityStreamCommentActions} from 'types/Activity';
import type {Attachment, IssueComment} from 'types/CustomFields';
import type {Theme} from 'types/Theme';

interface Props {
  activity: Activity;
  attachments?: Attachment[];
  commentActions?: ActivityStreamCommentActions;
  onCheckboxUpdate?: (
    checked: boolean,
    position: number,
    comment: IssueComment,
  ) => any;
  onLongPress?: (comment: IssueComment) => any;
}

const StreamComment = ({
  activity,
  attachments = [],
  commentActions,
  onCheckboxUpdate,
  onLongPress = () => {},
}: Props): React.JSX.Element | null => {
  const theme: Theme = useContext(ThemeContext);

  const comment: IssueComment = firstActivityChange(activity) as IssueComment;
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
    </>
  );
};

export default StreamComment;
