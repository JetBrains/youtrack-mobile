/* @flow */

import {ANALYTICS_ARTICLE_PAGE} from '../../components/analytics/analytics-ids';
import {Clipboard, Share} from 'react-native';
import {getApi} from '../../components/api/api__instance';
import {isIOSPlatform, until} from '../../util/util';
import {logEvent} from '../../components/log/log-helper';
import {notify} from '../../components/notification/notification';
import {
  setArticle,
  setError,
  setLoading,
  setActivityPage,
  setProcessing,
  setArticleDraft,
  setPrevArticle,
  setArticleCommentDraft
} from './article-reducers';
import {showActions} from '../../components/action-sheet/action-sheet';

import type ActionSheet from '@expo/react-native-action-sheet';
import type Api from '../../components/api/api';
import type {AppState} from '../../reducers';
import type {Article} from '../../flow/Article';
import type {ArticleState} from './article-reducers';
import type {IssueComment} from '../../flow/CustomFields';

type ApiGetter = () => Api;


const loadArticle = (articleId: string, reset: boolean = true) => {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: ApiGetter) => {
    const api: Api = getApi();

    logEvent({message: 'Loading article', analyticsId: ANALYTICS_ARTICLE_PAGE});

    if (reset) {
      dispatch(setLoading(true));
      dispatch(setArticle(null));
    }
    const [error, article] = await until(api.articles.getArticle(articleId));
    dispatch(setLoading(false));

    if (error) {
      dispatch(setError(error));
      logEvent({message: 'Failed to load articles', isError: true});
    } else {
      dispatch(setArticle(article));
    }
  };
};

const loadActivitiesPage = (reset: boolean = true) => {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: ApiGetter) => {
    const api: Api = getApi();
    const {article}: Article = getState().article;

    if (reset) {
      dispatch(setActivityPage(null));
      dispatch(setLoading(true));
    }
    const [error, activityPage] = await until(api.articles.getActivitiesPage(article.id));
    dispatch(setLoading(false));

    if (error) {
      dispatch(setError(error));
      logEvent({message: 'Failed to load articles activities', isError: true});
    } else {
      dispatch(setActivityPage(activityPage.activities));
      logEvent({message: 'Articles activity page loaded'});
    }
  };
};

const showArticleActions = (actionSheet: ActionSheet, canUpdate: boolean, onBeforeEdit: () => void) => {
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
        }
      },
      {
        title: 'Copy article URL',
        execute: () => {
          Clipboard.setString(url);
          logEvent({message: 'Copy article URL', analyticsId: ANALYTICS_ARTICLE_PAGE});
        }
      }
    ];

    if (canUpdate) {
      actions.push({
        title: 'Edit',
        execute: async () => {
          logEvent({message: 'Edit article', analyticsId: ANALYTICS_ARTICLE_PAGE});

          onBeforeEdit();
          let articleDraft: Article = (await dispatch(getArticleDrafts()))[0];
          if (!articleDraft) {
            articleDraft = await dispatch(createArticleDraft());
          }

          if (articleDraft) {
            dispatch(setDraft(articleDraft));
          }
        }
      });
    }

    actions.push({title: 'Cancel'});

    const selectedAction = await showActions(actions, actionSheet);

    if (selectedAction && selectedAction.execute) {
      selectedAction.execute();
    }
  };
};

const getArticleDrafts = () => {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: ApiGetter) => {
    const api: Api = getApi();
    const {article}: Article = getState().article;

    const [error, articleDrafts] = await until(api.articles.getArticleDrafts(article.idReadable));

    if (error) {
      const errorMsg: string = 'Failed to load article drafts';
      logEvent({message: errorMsg, isError: true});
      return [];
    } else {
      return articleDrafts;
    }
  };
};

const updateArticleDraft = (articleDraft: Article) => {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: ApiGetter) => {
    const api: Api = getApi();

    const [error] = await until(api.articles.updateArticleDraft(articleDraft));

    if (error) {
      const errorMsg: string = 'Failed to update article draft';
      logEvent({message: errorMsg, isError: true});
      notify(errorMsg, error);
    }
  };
};

const createArticleDraft = () => {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: ApiGetter) => {
    const api: Api = getApi();
    const {article}: Article = getState().article;

    const [error, articleDraft] = await until(api.articles.createArticleDraft(article.id));

    if (error) {
      const errorMsg: string = 'Failed to load article draft';
      logEvent({message: errorMsg, isError: true});
      notify(errorMsg, error);
      return null;
    } else {
      return articleDraft;
    }
  };
};

const publishArticleDraft = () => {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: ApiGetter) => {
    const api: Api = getApi();
    const {articleDraft, article}: Article = getState().article;

    dispatch(setProcessing(true));
    await updateArticleDraft(articleDraft);
    const [error] = await until(api.articles.publishArticleDraft(articleDraft.id));

    if (error) {
      const errorMsg: string = 'Failed to publish article draft';
      logEvent({message: errorMsg, isError: true});
      notify(errorMsg, error);
    } else {
      dispatch(setDraft(null));
      dispatch(setProcessing(false));
      dispatch(loadArticle(article.id, false));
    }
  };
};

const setDraft = (articleDraft: Article | null) => {
  return async (dispatch: (any) => any) => {
    dispatch(setArticleDraft(articleDraft));
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
      logEvent({message: 'Article comment added', analyticsId: ANALYTICS_ARTICLE_PAGE});
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
      logEvent({message: 'Article comment updated', analyticsId: ANALYTICS_ARTICLE_PAGE});
      dispatch(loadActivitiesPage());
    }
  };
};

export {
  loadArticle,
  loadActivitiesPage,
  showArticleActions,
  setPreviousArticle,

  getArticleDrafts,
  updateArticleDraft,
  createArticleDraft,
  publishArticleDraft,
  setDraft,

  getArticleCommentDraft,
  updateArticleCommentDraft,
  submitArticleCommentDraft,

  updateArticleComment
};
