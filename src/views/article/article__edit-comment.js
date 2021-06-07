/* @flow */

import React from 'react';

import {useDispatch} from 'react-redux';

import IssueCommentUpdate from '../../components/comment/comment-update';
import IssuePermissions from '../../components/issue-permissions/issue-permissions';
import {attachmentActions} from './article__activity__attachment-actions-and-types';
import {getApi} from '../../components/api/api__instance';
import {getMentions} from './arcticle-actions';

import type {Article} from '../../flow/Article';
import type {IssueComment} from '../../flow/CustomFields';

type Props = {
  article: Article,
  comment: IssueComment,
  issuePermissions: IssuePermissions,
  onCommentChange?: (comment: IssueComment, isAttachmentChange: boolean) => Promise<void> | void,
  onSubmitComment: (comment: IssueComment) => Promise<void>,
};


const ArticleActivityStreamCommentEdit = (props: Props) => {
  const dispatch: Function = useDispatch();

  const {onCommentChange = () => {}} = props;
  return (
    <IssueCommentUpdate
      isArticle={true}
      isEditMode={true}
      onAttach={attachmentActions.uploadFileToArticleComment}
      onCommentChange={onCommentChange}
      getVisibilityOptions={() => getApi().articles.getVisibilityOptions(props.article.id)}
      onSubmitComment={props.onSubmitComment}
      editingComment={props.comment}
      getCommentSuggestions={(query: string) => dispatch(getMentions(query))}
      canAttach={props.issuePermissions.canAddAttachmentTo(props.article)}
    />
  );
};

export default React.memo<Props>(ArticleActivityStreamCommentEdit);

