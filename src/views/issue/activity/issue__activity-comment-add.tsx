import React from 'react';

import {useSelector} from 'react-redux';
import {useDispatch} from 'hooks/use-dispatch';

import IssueCommentEdit from 'components/comment/comment-edit';
import IssueVisibility from 'components/visibility/issue-visibility';
import {AppState} from 'reducers';
import {attachmentActions} from './issue-activity__attachment-actions-and-types';
import {createActivityCommentActions} from './issue-activity__comment-actions';
import {getApi} from 'components/api/api__instance';
import {IssueContext} from 'views/issue/issue-context';

import type {IssueComment} from 'types/CustomFields';
import type {IssueContextData} from 'types/Issue';
import type {NormalizedAttachment} from 'types/Attachment';
import type {Visibility} from 'types/Visibility';

interface Props {
  comment: IssueComment;
  onAddSpentTime: null | (() => void);
  onCommentChange: (draftComment: IssueComment, isAttachmentChange?: boolean) => Promise<IssueComment | null>;
  onSubmitComment: (draftComment: IssueComment) => Promise<void>;
  stateFieldName: keyof AppState;
}

const IssueActivityStreamCommentAdd = (props: Props) => {
  const dispatch = useDispatch();
  const team = useSelector((state: AppState) => state.issueActivity.defaultProjectTeam);

  const {issuePermissions, issue}: IssueContextData = React.useContext(IssueContext);

  const canAttach = issuePermissions.canAddAttachmentTo(issue);
  const canCommentPublicly = issuePermissions.canCommentPublicly(issue);
  const canUpdateCommentVisibility = issuePermissions.canUpdateCommentVisibility(issue);
  const isHelpdeskIssue = issuePermissions.helpdesk.isHelpdeskProject(issue);

  const doUploadFileToComment = React.useCallback(
    (files: NormalizedAttachment[], comment: IssueComment) =>
      attachmentActions.doUploadFileToComment(false, files, issue, comment),
    [issue]
  );

  const getVisibilityOptions = React.useCallback(
    (q: string) => getApi().issue.getVisibilityOptions(issue.id, q),
    [issue.id]
  );

  const getCommentSuggestions = React.useCallback(
    async (query: string) =>
      dispatch(createActivityCommentActions(props.stateFieldName).loadCommentSuggestions(query)),
    [dispatch, props.stateFieldName]
  );

  const canRemoveAttach = React.useCallback(() => canAttach, [canAttach]);

  let visibility: Visibility | null = props?.comment?.visibility || null;
  if (!visibility && (!canCommentPublicly || (isHelpdeskIssue && issuePermissions.isPrivateAgentCommentByDefault())) && team) {
    visibility = IssueVisibility.createLimitedVisibility([team]);
  }

  const editingComment = React.useMemo(() => ({
    ...props.comment,
    issue: {id: issue.id},
    visibility,
    canUpdateVisibility:
      typeof props.comment?.canUpdateVisibility === 'boolean'
        ? props.comment.canUpdateVisibility
        : canUpdateCommentVisibility,
  }), [props.comment, issue.id, visibility, canUpdateCommentVisibility]);

  return (
    <IssueCommentEdit
      onCommentChange={props.onCommentChange}
      getVisibilityOptions={getVisibilityOptions}
      onSubmitComment={props.onSubmitComment}
      editingComment={editingComment}
      getCommentSuggestions={getCommentSuggestions}
      canAttach={canAttach}
      canUpdateCommentVisibility={canUpdateCommentVisibility}
      canRemoveAttach={canRemoveAttach}
      onAddSpentTime={props.onAddSpentTime}
      onAttach={doUploadFileToComment}
    />
  );
};

export default React.memo<Props>(IssueActivityStreamCommentAdd);
