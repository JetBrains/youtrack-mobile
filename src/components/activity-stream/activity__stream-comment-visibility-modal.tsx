import React from 'react';

import CommentVisibilityControl from 'components/visibility/comment-visibility-control';
import ModalPortal from 'components/modal-view/modal-portal';

import type {IssueComment} from 'types/CustomFields';
import {Entity} from 'types/Entity';


const ActivityStreamCommentVisibilityModal = ({
  comment,
  onUpdate,
  onDismiss,
}: {
  comment: IssueComment;
  onUpdate: () => void;
  onDismiss: () => void;
}) => {
  return <ModalPortal popup onHide={onDismiss}>
    <CommentVisibilityControl
      commentId={comment.id}
      entity={(comment.issue || comment.article) as Entity}
      onUpdate={onUpdate}
      visibility={comment.visibility!}
    />
  </ModalPortal>;
};

export default React.memo(ActivityStreamCommentVisibilityModal);
