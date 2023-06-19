import React from 'react';

import {useDispatch} from 'react-redux';

import IssueCommentEdit from 'components/comment/comment-edit';
import IssuePermissions from 'components/issue-permissions/issue-permissions';
import {attachmentActions} from './article__activity__attachment-actions-and-types';
import {getApi} from 'components/api/api__instance';
import {getMentions} from './arcticle-actions';
import {visibilityArticleDefaultText} from 'components/visibility/visibility-strings';

import type {Article} from 'types/Article';
import type {Attachment, IssueComment} from 'types/CustomFields';
import {NormalizedAttachment} from 'types/Attachment';

interface Props {
  article: Article;
  comment: IssueComment;
  issuePermissions: IssuePermissions;
  onCommentChange?: (comment: IssueComment, isAttachmentChange: boolean) => void;
  onSubmitComment: (comment: IssueComment) => void;
}


const ArticleActivityStreamCommentEdit = (props: Props) => {
  const dispatch: (...args: any[]) => any = useDispatch();
  const {article, issuePermissions, onCommentChange = (comment: IssueComment) => comment} = props;
  const doUploadFileToComment = (files: NormalizedAttachment[], comment: IssueComment) => {
    return attachmentActions.doUploadFileToComment(true, files, props.article, comment);
  };

  return (
    <IssueCommentEdit
      isArticle={true}
      isEditMode={true}
      onAttach={doUploadFileToComment}
      onCommentChange={onCommentChange}
      getVisibilityOptions={() => getApi().articles.getVisibilityOptions(article.id)}
      onSubmitComment={props.onSubmitComment}
      editingComment={{...props.comment, article: {is: article.id}}}
      getCommentSuggestions={(query: string) => dispatch(getMentions(query))}
      canAttach={issuePermissions.articleCanAddAttachment(article)}
      canRemoveAttach={(attachment: Attachment) => issuePermissions.articleCanDeleteAttachment(article)}
      visibilityLabel={visibilityArticleDefaultText()}
    />
  );
};

export default React.memo<Props>(ArticleActivityStreamCommentEdit);
