import React from 'react';
import IssueCommentEdit from 'components/comment/comment-edit';
import IssuePermissions from 'components/issue-permissions/issue-permissions';
import {attachmentActions} from './issue-activity__attachment-actions-and-types';
import {createActivityCommentActions} from './issue-activity__comment-actions';
import {getApi} from 'components/api/api__instance';
import type {AppState} from 'reducers';
import type {Attachment, IssueComment} from 'types/CustomFields';
import type {IssueContextData, IssueFull} from 'types/Issue';
import type {NormalizedAttachment} from 'types/Attachment';


interface Props {
  comment: IssueComment;
  issueContext: IssueContextData;
  onAddSpentTime?: () => void;
  onCommentChange: (comment: IssueComment, isAttachmentChange?: boolean) => Promise<IssueComment | null>;
  onSubmitComment: (comment: IssueComment) => Promise<void>;
  header?: React.ReactElement<React.ComponentProps<any>, any>;
  stateFieldName: keyof AppState;
}

const IssueActivityStreamCommentEdit = (props: Props) => {
  const issue: IssueFull = props.issueContext.issue;
  const issuePermissions: IssuePermissions = props.issueContext.issuePermissions;
  const dispatch: (...args: any[]) => any = props.issueContext.dispatcher;

  const doUploadFileToComment = (files: NormalizedAttachment[], comment: IssueComment) => {
    return attachmentActions.doUploadFileToComment(false, files, issue, comment);
  };

  const {
    onCommentChange = () => Promise.resolve(null),
    onAddSpentTime = null,
    stateFieldName,
  } = props;
  return (
    <IssueCommentEdit
      focus={true}
      onAttach={doUploadFileToComment}
      onCommentChange={onCommentChange}
      getVisibilityOptions={() => getApi().issue.getVisibilityOptions(issue.id)}
      onSubmitComment={props.onSubmitComment}
      editingComment={{...props.comment, issue: {id: issue.id}}}
      getCommentSuggestions={(query: string) =>
        dispatch(
          createActivityCommentActions(stateFieldName).loadCommentSuggestions(
            query,
          ),
        )
      }
      canAttach={issuePermissions.canAddAttachmentTo(issue)}
      canCommentPublicly={issuePermissions.canCommentPublicly(issue)}
      canUpdateCommentVisibility={issuePermissions.canUpdateCommentVisibility(issue)}
      canRemoveAttach={(attachment: Attachment) =>
        issuePermissions.canDeleteCommentAttachment(attachment, issue)
      }
      onAddSpentTime={onAddSpentTime}
      header={props.header}
    />
  );
};

export default React.memo<Props>(IssueActivityStreamCommentEdit);
