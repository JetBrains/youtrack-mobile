import React from 'react';
import {useDispatch} from 'react-redux';
import IssueCommentEdit from 'components/comment/comment-edit';
import IssuePermissions from 'components/issue-permissions/issue-permissions';
import {attachmentActions} from './article__activity__attachment-actions-and-types';
import {getApi} from 'components/api/api__instance';
import {getMentions} from './arcticle-actions';
import {visibilityArticleDefaultText} from 'components/visibility/visibility-strings';
import type {Article} from 'flow/Article';
import type {Attachment, IssueComment} from 'flow/CustomFields';
type Props = {
  article: Article;
  comment: IssueComment;
  issuePermissions: IssuePermissions;
  onCommentChange?: (
    comment: IssueComment,
    isAttachmentChange: boolean,
  ) => Promise<void> | void;
  onSubmitComment: (comment: IssueComment) => Promise<void>;
};

const ArticleActivityStreamCommentEdit = (props: Props) => {
  const dispatch: (...args: Array<any>) => any = useDispatch();
  const {article, issuePermissions, onCommentChange = () => {}} = props;
  return (
    <IssueCommentEdit
      isArticle={true}
      isEditMode={true}
      onAttach={attachmentActions.uploadFileToArticleComment}
      onCommentChange={onCommentChange}
      getVisibilityOptions={() =>
        getApi().articles.getVisibilityOptions(article.id)
      }
      onSubmitComment={props.onSubmitComment}
      editingComment={props.comment}
      getCommentSuggestions={(query: string) => dispatch(getMentions(query))}
      canAttach={issuePermissions.articleCanAddAttachment(article)}
      canRemoveAttach={(attachment: Attachment) =>
        issuePermissions.articleCanDeleteAttachment(article)
      }
      visibilityLabel={visibilityArticleDefaultText}
    />
  );
};

export default React.memo<Props>(
  ArticleActivityStreamCommentEdit,
) as React$AbstractComponent<Props, unknown>;