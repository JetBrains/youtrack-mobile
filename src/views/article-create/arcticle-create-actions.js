/* @flow */

import {ANALYTICS_ARTICLE_CREATE} from '../../components/analytics/analytics-ids';
import {logEvent} from '../../components/log/log-helper';
import {notify} from '../../components/notification/notification';
import {until} from '../../util/util';
import {
  setArticleDraft,
  setError,
  setProcessing
} from './article-create-reducers';

import type Api from '../../components/api/api';
import type {AppState} from '../../reducers';
import type {Article} from '../../flow/Article';

type ApiGetter = () => Api;

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

const createArticleDraft = (articleId?: string) => {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: ApiGetter) => {
    const api: Api = getApi();

    dispatch(setProcessing(true));
    const [error, articleDraft] = await until(api.articles.createArticleDraft(articleId));
    dispatch(setProcessing(false));

    if (error) {
      const errorMsg: string = 'Failed to create article draft';
      logEvent({message: errorMsg, isError: true});
      notify(errorMsg, error);
    } else {
      logEvent({message: 'Create article draft', analyticsId: ANALYTICS_ARTICLE_CREATE});
      dispatch(setDraft(articleDraft));
    }
  };
};

const publishArticleDraft = (articleDraft: Article) => {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: ApiGetter) => {
    const api: Api = getApi();

    dispatch(setProcessing(true));
    await dispatch(updateArticleDraft(articleDraft));
    const [error] = await until(api.articles.publishArticleDraft(articleDraft.id));
    dispatch(setProcessing(false));

    if (error) {
      const errorMsg: string = 'Failed to publish article draft';
      logEvent({message: errorMsg, isError: true});
      notify(errorMsg, error);
      dispatch(setError(error));
    } else {
      dispatch(setDraft(null));
      notify('Article published');
    }
  };
};

const setDraft = (articleDraft: Article | null) => {
  return async (dispatch: (any) => any) => {
    dispatch(setArticleDraft(articleDraft));
  };
};


export {
  updateArticleDraft,
  createArticleDraft,
  publishArticleDraft,
  setDraft
};
