/* @flow */

import {ANALYTICS_ARTICLE_PAGE} from '../../components/analytics/analytics-ids';
import {Alert, Clipboard, Share} from 'react-native';

import Router from '../../components/router/router';
import {confirmDeleteArticle} from './arcticle-helper';
import {getStorageState} from '../../components/storage/storage';
import {getApi} from '../../components/api/api__instance';
import {getEntityPresentation} from '../../components/issue-formatter/issue-formatter';
import {hasType} from '../../components/api/api__resource-types';
import {isIOSPlatform, until} from '../../util/util';
import {logEvent} from '../../components/log/log-helper';
import {notify} from '../../components/notification/notification';
import {
  setActivityPage,
  setArticle,
  setArticleCommentDraft,
  setError,
  setLoading,
  setPrevArticle,
  setProcessing,
} from './article-reducers';
import {cacheUserLastVisitedArticle} from '../../actions/app-actions';
import {showActions, showActionSheet} from '../../components/action-sheet/action-sheet';

import type ActionSheet, {ActionSheetOptions} from '@expo/react-native-action-sheet';
import type Api from '../../components/api/api';
import type {Activity} from '../../flow/Activity';
import type {AppState} from '../../reducers';
import type {Article, ArticleDraft} from '../../flow/Article';
import type {ArticleState} from './article-reducers';
import type {Attachment, IssueComment} from '../../flow/CustomFields';
import type {ShowActionSheetWithOptions} from '../../components/action-sheet/action-sheet';

type ApiGetter = () => Api;


const clearArticle = () => async (dispatch: (any) => any) => dispatch(setArticle(null));

const loadArticleFromCache = (article: Article) => {
  return async (dispatch: (any) => any) => {
    const cachedArticleLastVisited: {
      article?: Article,
      activities?: Array<Activity>
    } | null = getStorageState().articleLastVisited;
    if (!cachedArticleLastVisited || !cachedArticleLastVisited.article || !article) {
      return;
    }
    if (article?.id === cachedArticleLastVisited.article?.id ||
      article?.idReadable === cachedArticleLastVisited.article?.idReadable
    ) {
      dispatch(setArticle(cachedArticleLastVisited.article));
    }
  };
};

const loadArticle = (articleId: string, reset: boolean = true) => {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: ApiGetter) => {
    const api: Api = getApi();

    logEvent({message: 'Loading article'});

    dispatch(setLoading(true));
    if (reset) {
      dispatch(setArticle(null));
    }
    const [error, article] = await until(api.articles.getArticle(articleId));
    dispatch(setLoading(false));

    if (error) {
      dispatch(setError(error));
      logEvent({message: 'Failed to load articles', isError: true});
    } else {
      logEvent({message: 'Article loaded'});
      dispatch(setArticle(article));

      cacheUserLastVisitedArticle(article);
    }
  };
};

const loadCachedActivitiesPage = () => {
  return async (dispatch: (any) => any) => {
    const cachedArticleLastVisited: {
      article?: Article,
      activities?: Array<Activity>
    } | null = getStorageState().articleLastVisited;
    if (cachedArticleLastVisited && cachedArticleLastVisited.activities) {
      dispatch(setActivityPage(cachedArticleLastVisited.activities));
    }
  };
};

const loadActivitiesPage = (reset: boolean = true) => {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: ApiGetter) => {
    const api: Api = getApi();
    const {article}: Article = getState().article;

    dispatch(setLoading(true));
    if (reset) {
      dispatch(setActivityPage(null));
    }
    const [error, activityPage] = await until(api.articles.getActivitiesPage(article.id));
    dispatch(setLoading(false));

    if (error) {
      dispatch(setError(error));
      logEvent({message: 'Failed to load articles activities', isError: true});
    } else {
      dispatch(setActivityPage(activityPage.activities));
      cacheUserLastVisitedArticle(article, activityPage.activities);
      logEvent({message: 'Articles activity page loaded'});
    }
  };
};

const showArticleActions = (
  actionSheet: ActionSheet,
  canUpdate: boolean,
  canDelete: boolean,
  renderBreadCrumbs: Function,
  canStar: boolean,
  hasStar: boolean
) => {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: ApiGetter) => {
    const api: Api = getApi();
    const {article} = getState().article;
    const url: string = `${api.config.backendUrl}/articles/${article.idReadable}`;

    const actions = [
      {
        title: 'Share…',
        execute: () => {
          const msg: string = 'Share article URL';
          if (isIOSPlatform()) {
            Share.share({url});
          } else {
            Share.share({title: article.summary, message: url}, {dialogTitle: msg});
          }
          logEvent({message: msg, analyticsId: ANALYTICS_ARTICLE_PAGE});
        },
      },
      {
        title: 'Copy article URL',
        execute: () => {
          Clipboard.setString(url);
          logEvent({message: 'Copy article URL', analyticsId: ANALYTICS_ARTICLE_PAGE});
        },
      },
    ];

    if (canStar) {
      const title: string = hasStar ? 'Unsubscribe from updates' : 'Subscribe for updates';
      actions.push({
        title: title,
        execute: async () => {
          logEvent({
            message: `Article: ${title}`,
            analyticsId: ANALYTICS_ARTICLE_PAGE,
          });
          notify(
            hasStar
              ? 'You\'ve been unsubscribed from updates'
              : 'You\'ve been subscribed for updates'
          );
          dispatch(toggleFavorite());
        },
      });
    }

    if (canUpdate) {
      actions.push({
        title: 'Edit',
        execute: async () => {
          logEvent({
            message: 'Edit article',
            analyticsId: ANALYTICS_ARTICLE_PAGE,
          });

          setProcessing(true);
          const articleDrafts: Article | null = await getUnpublishedArticleDraft(api, article);
          setProcessing(false);
          Router.ArticleCreate({
            originalArticleId: article.id,
            articleDraft: Array.isArray(articleDrafts) ? articleDrafts[0] : articleDrafts,
            breadCrumbs: renderBreadCrumbs(),
          });
        },
      });
    }

    if (canDelete) {
      actions.push({
        title: 'Delete',
        execute: async () => {
          logEvent({
            message: 'Delete article',
            analyticsId: ANALYTICS_ARTICLE_PAGE,
          });

          confirmDeleteArticle()
            .then(() => dispatch(deleteArticle(article, () => Router.KnowledgeBase())))
            .catch(() => {});
        },
      });
    }

    actions.push({title: 'Cancel'});

    const selectedAction = await showActions(actions, actionSheet);

    if (selectedAction && selectedAction.execute) {
      selectedAction.execute();
    }
  };
};

const getUnpublishedArticleDraft = async (api: Api, article: Article): Promise<ArticleDraft | null> => {
  let articleDraft: ArticleDraft | null = null;

  const [error, articleDrafts] = await until(api.articles.getArticleDrafts(article.id));

  if (error) {
    logEvent({message: `Failed to load ${article.idReadable} article drafts`, isError: true});
  } else {
    if (articleDrafts && articleDrafts[0]) {
      articleDraft = articleDrafts[0];
    } else {
      articleDraft = {
        attachments: article.attachments,
        summary: article.summary,
        content: article.content,
        project: article.project,
        visibility: article.visibility,
      };
    }
  }

  return articleDraft;
};

export const createArticleDraft = async (
  api: Api,
  article: Article,
  createSubArticle: boolean = false
): Promise<ArticleDraft | null> => {
  let articleDraft: Article | null = null;

  const [createDraftError, draft] = await until(
    createSubArticle
      ? api.articles.createSubArticleDraft(article)
      : api.articles.createArticleDraft(article.id)
  );
  if (createDraftError) {
    logEvent({message: `Failed to create a draft for the article ${article.idReadable}`, isError: true});
  } else {
    articleDraft = draft;
  }

  return articleDraft;
};

const deleteArticle = (article: Article, onAfterDelete?: () => any) => {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: ApiGetter) => {
    const api: Api = getApi();
    const isDraft: boolean = hasType.articleDraft(article);

    dispatch(setProcessing(true));
    const [error] = await until(
      isDraft
        ? api.articles.deleteDraft(article.id)
        : api.articles.deleteArticle(article.id)
    );
    dispatch(setProcessing(false));

    if (error) {
      const errorMsg: string = 'Failed to delete article';
      logEvent({message: errorMsg, isError: true});
      notify(errorMsg, error);
    } else if (onAfterDelete) {
      onAfterDelete();
    }
  };
};

const setPreviousArticle = () => {
  return async (dispatch: (any) => any, getState: () => AppState) => {
    const articleState: ArticleState = getState().article;
    dispatch(setPrevArticle(articleState));
  };
};

const createArticleCommentDraft = (commentDraftText: string) => {
  return async (dispatch: (any) => any, getState: () => AppState) => {
    const api: Api = getApi();
    const {article}: Article = getState().article;

    const [error, commentDraft] = await until(api.articles.createCommentDraft(article.id, commentDraftText));
    if (error) {
      notify('Failed to create a comment draft', error);
      return null;
    } else {
      await dispatch(setArticleCommentDraft(commentDraft));
      return commentDraft;
    }
  };
};

const getArticleCommentDraft = () => {
  return async (dispatch: (any) => any, getState: () => AppState) => {
    const api: Api = getApi();
    const {article}: Article = getState().article;

    const [error, articleDraftCommentResponse] = await until(api.articles.getCommentDraft(article.id));
    if (!error && articleDraftCommentResponse.draftComment) {
      dispatch(setArticleCommentDraft(articleDraftCommentResponse.draftComment));
    }
  };
};

const updateArticleCommentDraft = (commentDraftText: string) => {
  return async (dispatch: (any) => any, getState: () => AppState) => {
    const api: Api = getApi();
    const {article}: Article = getState().article;
    const articleCommentDraft: ?Comment = getState().article.articleCommentDraft;

    if (!articleCommentDraft) {
      await dispatch(createArticleCommentDraft(commentDraftText));
    }

    const [error, updatedCommentDraft] = await until(api.articles.updateCommentDraft(article.id, commentDraftText));
    if (error) {
      notify('Failed to update a comment draft', error);
    } else {
      dispatch(setArticleCommentDraft(updatedCommentDraft));
    }
  };
};

const submitArticleCommentDraft = (commentDraftText: string) => {
  return async (dispatch: (any) => any, getState: () => AppState) => {
    const api: Api = getApi();
    const {article}: Article = getState().article;
    const articleCommentDraft: IssueComment = getState().article.articleCommentDraft;

    await dispatch(updateArticleCommentDraft(commentDraftText));
    const [error] = await until(api.articles.submitCommentDraft(article.id, articleCommentDraft.id));
    if (error) {
      notify('Failed to update a comment draft', error);
    } else {
      logEvent({message: 'Comment added', analyticsId: ANALYTICS_ARTICLE_PAGE});
      dispatch(setArticleCommentDraft(null));
    }
  };
};

const updateArticleComment = (comment: IssueComment) => {
  return async (dispatch: (any) => any, getState: () => AppState) => {
    const api: Api = getApi();
    const {article}: Article = getState().article;

    const [error] = await until(api.articles.updateComment(article.id, comment));
    if (error) {
      notify('Failed to update a comment', error);
    } else {
      logEvent({message: 'Comment updated', analyticsId: ANALYTICS_ARTICLE_PAGE});
      dispatch(loadActivitiesPage());
    }
  };
};

const deleteArticleComment = (commentId: string) => {
  return async (dispatch: (any) => any, getState: () => AppState) => {
    const api: Api = getApi();
    const {article}: Article = getState().article;

    try {
      await new Promise((resolve: Function, reject: Function) => {
        Alert.alert(
          'Are you sure you want to delete this comment?',
          null,
          [
            {text: 'Cancel', style: 'cancel', onPress: reject},
            {text: 'Delete', onPress: resolve},
          ],
          {cancelable: true}
        );
      });

      const [error] = await until(api.articles.deleteComment(article.id, commentId));
      if (error) {
        notify('Failed to delete a comment', error);
      } else {
        dispatch(loadActivitiesPage());
      }
    } catch (error) {
      //
    }
  };
};

const showArticleCommentActions = (
  showActionSheetWithOptions: ShowActionSheetWithOptions,
  comment: IssueComment,
  activityId: string,
  canDeleteComment: boolean
) => {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: ApiGetter) => {
    const api: Api = getApi();
    const {article} = getState().article;

    const url: string = `${api.config.backendUrl}/articles/${article.idReadable}#comment${activityId}`;
    const commentText = comment.text;
    const options: Array<ActionSheetOptions> = [
      {
        title: 'Share…',
        execute: function (): string {
          const params: Object = {};
          const isIOS: boolean = isIOSPlatform();

          if (isIOS) {
            params.url = url;
          } else {
            params.title = commentText;
            params.message = url;
          }
          Share.share(params, {dialogTitle: 'Share URL'});
          logEvent({message: 'Share article', analyticsId: ANALYTICS_ARTICLE_PAGE});
          return this.title;
        },
      },
      {
        title: 'Copy URL',
        execute: function (): string {
          logEvent({message: 'Copy article URL', analyticsId: ANALYTICS_ARTICLE_PAGE});
          Clipboard.setString(url);
          return this.title;
        },
      },
    ];

    if (canDeleteComment) {
      options.push({
        title: 'Delete',
        execute: function () {
          logEvent({message: 'Delete article', analyticsId: ANALYTICS_ARTICLE_PAGE});
          dispatch(deleteArticleComment(comment.id));
          return this.title;
        },
      });
    }

    options.push({title: 'Cancel'});

    const selectedAction = await showActionSheet(
      options,
      showActionSheetWithOptions,
      comment?.author ? getEntityPresentation(comment.author) : null,
      commentText.length > 155 ? `${commentText.substr(0, 153)}…` : commentText
    );
    if (selectedAction && selectedAction.execute) {
      const actionTitle: string = selectedAction.execute();
      logEvent({message: `comment ${actionTitle}`, analyticsId: ANALYTICS_ARTICLE_PAGE});
    }
  };
};

const getMentions = (query: string) => {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: ApiGetter) => {
    const api: Api = getApi();
    const {article} = getState().article;
    const [error, mentions] = await until(
      api.mentions.getMentions(query, {containers: [{$type: article.$type, id: article.id}]}));
    if (error) {
      notify('Failed to load user mentions', error);
      return null;
    }
    return mentions;
  };
};

const toggleFavorite = () => {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: ApiGetter) => {
    const api: Api = getApi();
    const {article} = getState().article;

    const prev: boolean = article.hasStar;
    dispatch(setArticle({...article, hasStar: !prev}));

    const [error] = await until(api.articles.updateArticle(article.id, {hasStar: !prev}));
    if (error) {
      notify('Failed to update the article', error);
      dispatch(setArticle({...article, hasStar: prev}));
    }
  };
};

const deleteAttachment = (attachmentId: string) => {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: ApiGetter) => {
    const api: Api = getApi();
    const {article} = getState().article;

    const [error] = await until(api.articles.deleteAttachment(article.id, attachmentId));
    if (error) {
      const message = 'Failed to delete attachment';
      notify(message, error);
      logEvent({message: message, isError: true});
    } else {
      logEvent({message: 'Attachment deleted', analyticsId: ANALYTICS_ARTICLE_PAGE});
      dispatch(setArticle(
        {
          ...article, attachments: article.attachments.filter((it: Attachment) => it.id !== attachmentId),
        }));
    }
  };
};

const createSubArticle = (renderBreadCrumbs: Function) => {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: ApiGetter) => {
    const api: Api = getApi();
    const {article} = getState().article;

    logEvent({message: 'Create sub-article', analyticsId: ANALYTICS_ARTICLE_PAGE});
    const draft: ArticleDraft = await createArticleDraft(api, article, true);
    if (draft) {
      Router.ArticleCreate({
        isNew: true,
        articleDraft: draft,
        breadCrumbs: renderBreadCrumbs(),
      });
    }
  };
};

export {
  clearArticle,
  createSubArticle,
  loadArticle,
  loadActivitiesPage,
  loadCachedActivitiesPage,
  loadArticleFromCache,
  showArticleActions,
  setPreviousArticle,
  deleteArticle,

  getArticleCommentDraft,
  updateArticleCommentDraft,
  submitArticleCommentDraft,

  updateArticleComment,

  showArticleCommentActions,
  deleteArticleComment,

  getMentions,
  toggleFavorite,

  deleteAttachment,
};
