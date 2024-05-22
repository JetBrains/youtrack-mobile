import React, {useCallback, useEffect} from 'react';

import {useDispatch, useSelector} from 'react-redux';

import * as articleActions from './arcticle-actions';
import IssueCommentEdit from 'components/comment/comment-edit';
import IssuePermissions from 'components/issue-permissions/issue-permissions';
import IssueVisibility from 'components/visibility/issue-visibility';
import {attachmentActions} from './article__activity__attachment-actions-and-types';
import {getApi} from 'components/api/api__instance';
import {visibilityArticleDefaultText} from 'components/visibility/visibility-strings';

import type {AppState} from 'reducers';
import type {Article} from 'types/Article';
import type {IssueComment} from 'types/CustomFields';
import type {ReduxThunkDispatch} from 'types/Redux';

interface Props {
  article: Article;
  comment: IssueComment | null;
  onCommentChange: (draftComment: IssueComment, isAttachmentChange?: boolean) => Promise<IssueComment | null>;
  onSubmitComment: (draftComment: IssueComment) => Promise<void>;
}

const ArticleAddComment = (props: Props) => {
  const dispatch: ReduxThunkDispatch = useDispatch();
  const issuePermissions: IssuePermissions = useSelector((state: AppState) => state.app.issuePermissions);
  const isAgent = issuePermissions.helpdesk.isAgent(props.article);
  const isReporter = issuePermissions.helpdesk.isReporter(props.article);
  const isHelpdesk = issuePermissions.helpdesk.isHelpdeskProject(props.article);
  const team = useSelector((state: AppState) => state.article.defaultTeam);

  const loadDraftComment = useCallback(async () => {
    await dispatch(articleActions.getArticleCommentDraft());
  }, [dispatch]);
  useEffect(() => {
    loadDraftComment();
  }, [loadDraftComment]);

  const canAttach: boolean = issuePermissions.articleCanAddAttachment(props.article);
  const canUpdateVisibility: boolean =
    typeof props.comment?.canUpdateVisibility === 'boolean'
      ? props.comment?.canUpdateVisibility
      : issuePermissions.canUpdateCommentVisibility(props.article);
  const visibility = isHelpdesk && team ? IssueVisibility.createLimitedVisibility([team]) : undefined;

  return (
    <IssueCommentEdit
      isArticle={true}
      onCommentChange={props.onCommentChange}
      getVisibilityOptions={() => getApi().articles.getVisibilityOptions(props.article.id)}
      onSubmitComment={props.onSubmitComment}
      editingComment={{...props.comment, article: {id: props.article.id}, visibility}}
      getCommentSuggestions={(query: string) => dispatch(articleActions.getMentions(query))}
      canAttach={canAttach}
      canRemoveAttach={() => canAttach}
      canCommentPublicly={issuePermissions.canCommentPublicly(props.article)}
      canUpdateCommentVisibility={canUpdateVisibility || (!isAgent && !isReporter)}
      onAttach={attachmentActions.uploadFileToArticleComment}
      visibilityLabel={visibilityArticleDefaultText()}
    />
  );
};

export default React.memo<Props>(ArticleAddComment);
