/* @flow */

import React from 'react';

import IssueCommentEdit from 'components/comment/comment-edit';
import IssuePermissions from 'components/issue-permissions/issue-permissions';
import {attachmentActions} from './issue-activity__attachment-actions-and-types';
import {createActivityCommentActions} from './issue-activity__comment-actions';
import {getApi} from 'components/api/api__instance';

import type {Attachment, IssueComment} from 'flow/CustomFields';
import type {IssueContextData, IssueFull} from 'flow/Issue';

type Props = {
  comment: IssueComment,
  issueContext: IssueContextData,
  onAddSpentTime?: () => void,
  onCommentChange?: (comment: IssueComment, isAttachmentChange: boolean) => Promise<void> | void,
  onSubmitComment: (comment: IssueComment) => Promise<void>,
  header?: React$Element<any>,
  stateFieldName: string,
};


const IssueActivityStreamCommentEdit = (props: Props) => {
  const issue: IssueFull = props.issueContext.issue;
  const issuePermissions: IssuePermissions = props.issueContext.issuePermissions;
  const dispatch: Function = props.issueContext.dispatcher;

  const {onCommentChange = () => {}, onAddSpentTime = null, stateFieldName} = props;
  return (
    <IssueCommentEdit
      focus={true}
      onAttach={attachmentActions.uploadFileToIssueComment}
      onCommentChange={onCommentChange}
      getVisibilityOptions={() => getApi().issue.getVisibilityOptions(issue.id)}
      onSubmitComment={props.onSubmitComment}
      editingComment={props.comment}
      getCommentSuggestions={(query: string) => dispatch(createActivityCommentActions(stateFieldName).loadCommentSuggestions(query))}
      canAttach={issuePermissions.canAddAttachmentTo(issue)}
      canRemoveAttach={(attachment: Attachment) => issuePermissions.canDeleteCommentAttachment(attachment, issue)}
      onAddSpentTime={onAddSpentTime}
      header={props.header}
    />
  );
};

export default (React.memo<Props>(IssueActivityStreamCommentEdit): React$AbstractComponent<Props, mixed>);

