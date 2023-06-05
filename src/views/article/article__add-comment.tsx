import React, {useCallback, useEffect} from 'react';

import {useDispatch} from 'react-redux';

import * as articleActions from './arcticle-actions';
import IssueCommentEdit from 'components/comment/comment-edit';
import IssuePermissions from 'components/issue-permissions/issue-permissions';
import {attachmentActions} from './article__activity__attachment-actions-and-types';
import {getApi} from 'components/api/api__instance';
import {visibilityArticleDefaultText} from 'components/visibility/visibility-strings';

import type {Article} from 'types/Article';
import type {IssueComment} from 'types/CustomFields';

interface Props {
  article: Article;
  issuePermissions: IssuePermissions;
  comment: IssueComment | null;
  onCommentChange: (draftComment: IssueComment) => Promise<void>;
  onSubmitComment: (draftComment: IssueComment) => Promise<void>;
}


const ArticleAddComment = (props: Props) => {
  const dispatch = useDispatch();
  const loadDraftComment = useCallback(
    async () => {
      await dispatch(articleActions.getArticleCommentDraft());
    },
    [dispatch],
  );
  useEffect(() => {
    loadDraftComment();
  }, [loadDraftComment]);

  const canAttach: boolean = props.issuePermissions.articleCanAddAttachment(props.article);

  return (
    <IssueCommentEdit
      isArticle={true}
      onCommentChange={props.onCommentChange}
      getVisibilityOptions={() => getApi().articles.getVisibilityOptions(props.article.id)}
      onSubmitComment={props.onSubmitComment}
      editingComment={{...props.comment, article: {id: props?.article?.id}}}
      getCommentSuggestions={(query: string) => dispatch(articleActions.getMentions(query))}
      canAttach={canAttach}
      canRemoveAttach={() => canAttach}
      onAttach={attachmentActions.uploadFileToArticleComment}
      visibilityLabel={visibilityArticleDefaultText()}
    />
  );
};

export default React.memo<Props>(ArticleAddComment);
