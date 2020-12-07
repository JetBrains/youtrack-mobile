/* @flow */

import {ANALYTICS_ARTICLE_PAGE} from '../../components/analytics/analytics-ids';
import {logEvent} from '../../components/log/log-helper';
import {setArticle, setError, setLoading, setActivityPage} from './article-reducers';
import {until} from '../../util/util';

import type Api from '../../components/api/api';
import type {ArticleState} from './article-reducers';

type ApiGetter = () => Api;


const loadArticle = (articleId: string) => {
  return async (dispatch: (any) => any, getState: () => ArticleState, getApi: ApiGetter) => {
    const api: Api = getApi();

    logEvent({message: 'Loading articles', analyticsId: ANALYTICS_ARTICLE_PAGE});

    dispatch(setLoading(true));
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

const loadActivitiesPage = (articleId: string) => {
  return async (dispatch: (any) => any, getState: () => ArticleState, getApi: ApiGetter) => {
    const api: Api = getApi();

    dispatch(setActivityPage(null));
    dispatch(setLoading(true));
    const [error, activityPage] = await until(api.articles.getActivitiesPage(articleId));
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


export {
  loadArticle,
  loadActivitiesPage
};
