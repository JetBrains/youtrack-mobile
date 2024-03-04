import React from 'react';

import {useDispatch, useSelector} from 'react-redux';

import IssueCommentEdit from 'components/comment/comment-edit';
import IssuePermissions from 'components/issue-permissions/issue-permissions';
import IssueVisibility from 'components/visibility/issue-visibility';
import {attachmentActions} from './issue-activity__attachment-actions-and-types';
import {createActivityCommentActions} from './issue-activity__comment-actions';
import {getApi} from 'components/api/api__instance';
import {isHelpdeskProject} from 'components/helpdesk';
import {IssueContext} from 'views/issue/issue-context';

import type {IssueComment} from 'types/CustomFields';
import type {IssueContextData} from 'types/Issue';
import {AppState} from 'reducers';
import {NormalizedAttachment} from 'types/Attachment';
import {ReduxThunkDispatch} from 'types/Redux';

interface Props {
  comment: IssueComment;
  onAddSpentTime: null | (() => void);
  onCommentChange: (draftComment: IssueComment, isAttachmentChange?: boolean) => Promise<IssueComment | null>;
  onSubmitComment: (draftComment: IssueComment) => Promise<void>;
  stateFieldName: keyof AppState;
}

const IssueActivityStreamCommentAdd = (props: Props) => {
  const dispatch: ReduxThunkDispatch = useDispatch();
  const team = useSelector((state: AppState) => state.issueActivity.defaultProjectTeam);

  const issueContext: IssueContextData = React.useContext(IssueContext);
  const issue = issueContext.issue;
  const issuePermissions: IssuePermissions = issueContext.issuePermissions;
  const canAttach = issuePermissions.canAddAttachmentTo(issue);
  const canCommentPublicly = issuePermissions.canCommentPublicly(issue);
  const canUpdateCommentVisibility = issuePermissions.canUpdateCommentVisibility(issue);

  const doUploadFileToComment = (files: NormalizedAttachment[], comment: IssueComment) => {
    return attachmentActions.doUploadFileToComment(false, files, issue, comment);
  };

  return (
    <IssueCommentEdit
      onCommentChange={props.onCommentChange}
      getVisibilityOptions={() => getApi().issue.getVisibilityOptions(issue.id)}
      onSubmitComment={props.onSubmitComment}
      editingComment={{
        ...props.comment,
        issue: {id: issue.id},
        visibility: team ? IssueVisibility.createLimitedVisibility([team]) : issue.visibility,
        canUpdateVisibility: props.comment?.canUpdateVisibility || !isHelpdeskProject(issue),
      }}
      getCommentSuggestions={async (query: string) =>
        dispatch(createActivityCommentActions(props.stateFieldName).loadCommentSuggestions(query))
      }
      canAttach={canAttach}
      canCommentPublicly={canCommentPublicly}
      canUpdateCommentVisibility={canUpdateCommentVisibility}
      canRemoveAttach={() => canAttach}
      onAddSpentTime={props.onAddSpentTime}
      onAttach={doUploadFileToComment}
    />
  );
};

export default React.memo<Props>(IssueActivityStreamCommentAdd);
