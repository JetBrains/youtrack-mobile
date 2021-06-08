/* @flow */

import React, {useContext} from 'react';

import {useDispatch} from 'react-redux';

import * as commentActions from './issue-activity__comment-actions';
import IssueCommentEdit from '../../../components/comment/comment-edit';
import IssuePermissions from '../../../components/issue-permissions/issue-permissions';
import {attachmentActions} from './issue-activity__attachment-actions-and-types';
import {getApi} from '../../../components/api/api__instance';
import {IssueContext} from '../issue-context';

import type {IssueComment} from '../../../flow/CustomFields';
import type {IssueContextData, IssueFull} from '../../../flow/Issue';

type Props = {
  comment: IssueComment,
  onAddSpentTime: null | (() => void),
  onCommentChange: (draftComment: IssueComment) => Promise<void>,
  onSubmitComment: (draftComment: IssueComment) => Promise<void>,
};


const IssueActivityStreamCommentAdd = (props: Props) => {
  const dispatch = useDispatch();
  const issueContext: IssueContextData = useContext(IssueContext);
  const issue: IssueFull = issueContext.issue;
  const issuePermissions: IssuePermissions = issueContext.issuePermissions;

  return (
    <IssueCommentEdit
      onCommentChange={props.onCommentChange}
      getVisibilityOptions={() => getApi().issue.getVisibilityOptions(issue.id)}
      onSubmitComment={props.onSubmitComment}
      editingComment={props.comment}
      getCommentSuggestions={(query: string) => dispatch(commentActions.loadCommentSuggestions(query))}
      canAttach={issuePermissions.canAddAttachmentTo(issue)}
      onAddSpentTime={props.onAddSpentTime}
      onAttach={attachmentActions.uploadFileToIssueComment}
    />
  );
};

export default React.memo<Props>(IssueActivityStreamCommentAdd);

