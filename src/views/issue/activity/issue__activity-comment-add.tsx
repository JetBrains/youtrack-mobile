import React, {useContext} from 'react';
import {useDispatch} from 'react-redux';
import IssueCommentEdit from 'components/comment/comment-edit';
import IssuePermissions from 'components/issue-permissions/issue-permissions';
import {attachmentActions} from './issue-activity__attachment-actions-and-types';
import {createActivityCommentActions} from './issue-activity__comment-actions';
import {getApi} from 'components/api/api__instance';
import {IssueContext} from '../issue-context';
import type {IssueComment} from 'types/CustomFields';
import type {IssueContextData, IssueFull} from 'types/Issue';
type Props = {
  comment: IssueComment;
  onAddSpentTime: null | (() => void);
  onCommentChange: (draftComment: IssueComment) => Promise<void>;
  onSubmitComment: (draftComment: IssueComment) => Promise<void>;
  stateFieldName: string;
};

const IssueActivityStreamCommentAdd = (props: Props) => {
  const dispatch = useDispatch();
  const issueContext: IssueContextData = useContext(IssueContext);
  const issue: IssueFull = issueContext.issue;
  const issuePermissions: IssuePermissions = issueContext.issuePermissions;
  const canAttach: boolean = issuePermissions.canAddAttachmentTo(issue);
  return (
    <IssueCommentEdit
      onCommentChange={props.onCommentChange}
      getVisibilityOptions={() => getApi().issue.getVisibilityOptions(issue.id)}
      onSubmitComment={props.onSubmitComment}
      editingComment={{...props.comment, issue: {id: issue.id}}}
      getCommentSuggestions={(query: string) =>
        dispatch(
          createActivityCommentActions(
            props.stateFieldName,
          ).loadCommentSuggestions(query),
        )
      }
      canAttach={canAttach}
      canRemoveAttach={() => canAttach}
      onAddSpentTime={props.onAddSpentTime}
      onAttach={attachmentActions.uploadFileToIssueComment}
    />
  );
};

export default React.memo<Props>(IssueActivityStreamCommentAdd);
