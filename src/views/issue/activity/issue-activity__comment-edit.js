/* @flow */

import React from 'react';

import * as commentActions from './issue-activity__comment-actions';
import IssueCommentEdit from '../../../components/comment/comment-edit';
import IssuePermissions from '../../../components/issue-permissions/issue-permissions';
import {attachmentActions} from './issue-activity__attachment-actions-and-types';
import {getApi} from '../../../components/api/api__instance';

import type {IssueComment} from '../../../flow/CustomFields';
import type {IssueContextData, IssueFull} from '../../../flow/Issue';

type Props = {
  comment: IssueComment,
  issueContext: IssueContextData,
  onAddSpentTime?: () => void,
  onCommentChange?: (comment: IssueComment, isAttachmentChange: boolean) => Promise<void> | void,
  onSubmitComment: (comment: IssueComment) => Promise<void>,
};


const IssueActivityStreamCommentEdit = (props: Props) => {
  const issue: IssueFull = props.issueContext.issue;
  const issuePermissions: IssuePermissions = props.issueContext.issuePermissions;
  const dispatch: Function = props.issueContext.dispatcher;

  const {onCommentChange = () => {}, onAddSpentTime = null} = props;
  return (
    <IssueCommentEdit
      isEditMode={true}
      onAttach={attachmentActions.uploadFileToIssueComment}
      onCommentChange={onCommentChange}
      getVisibilityOptions={() => getApi().issue.getVisibilityOptions(issue.id)}
      onSubmitComment={props.onSubmitComment}
      editingComment={props.comment}
      getCommentSuggestions={(query: string) => dispatch(commentActions.loadCommentSuggestions(query))}
      canAttach={issuePermissions.canAddAttachmentTo(issue)}
      onAddSpentTime={onAddSpentTime}
    />
  );
};

export default React.memo<Props>(IssueActivityStreamCommentEdit);

