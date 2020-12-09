/* @flow */

import {ANALYTICS_ARTICLES_PAGE} from '../../components/analytics/analytics-ids';
import {createTree} from './knowledge-base-helper';
import {flushStoragePart, getStorageState} from '../../components/storage/storage';
import {logEvent} from '../../components/log/log-helper';
import {setError, setLoading, setList} from './knowledge-base-reducers';
import {until} from '../../util/util';

import type Api from '../../components/api/api';
import type {ArticleNode, ArticlesList} from '../../flow/Article';
import type {KnowledgeBaseState} from './knowledge-base-reducers';

type ApiGetter = () => Api;


const setArticlesListCache = (articlesList: ArticlesList) => {
  flushStoragePart({articlesList});
};

const loadArticlesListFromCache = () => {
  return async (dispatch: (any) => any) => {
    const cachedArticlesList: ArticlesList = getStorageState().articlesList;
    if (cachedArticlesList?.length > 0) {
      dispatch(setList(cachedArticlesList));
      logEvent({message: 'Set articles list from cache'});
    }
  };
};

const loadArticlesList = (reset: boolean = true) => {
  return async (dispatch: (any) => any, getState: () => KnowledgeBaseState, getApi: ApiGetter) => {
    const api: Api = getApi();

    logEvent({message: 'Loading articles', analyticsId: ANALYTICS_ARTICLES_PAGE});

    if (reset) {
      dispatch(setLoading(true));
    }
    const [error, articles] = await until(api.articles.get());
    dispatch(setLoading(false));

    if (error) {
      dispatch(setError(error));
      logEvent({message: 'Failed to load articles', isError: true});
    } else {
      const tree: Array<ArticleNode> = createTree(articles);
      const articlesTree: ArticlesList = tree.filter(it => it.data.length > 0);
      dispatch(setList(articlesTree));
      setArticlesListCache(articlesTree);
    }
  };
};

export {
  loadArticlesList,
  loadArticlesListFromCache
};
