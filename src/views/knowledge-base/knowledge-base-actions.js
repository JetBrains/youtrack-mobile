/* @flow */

import {ANALYTICS_ARTICLES_PAGE} from '../../components/analytics/analytics-ids';
import {createTree} from './knowledge-base-helper';
import {logEvent} from '../../components/log/log-helper';
import {setError, setLoading, setTree} from './knowledge-base-reducers';
import {until} from '../../util/util';

import type Api from '../../components/api/api';
import type {ArticleNode, ArticlesList} from '../../flow/Article';
import type {KnowledgeBaseState} from './knowledge-base-reducers';

type ApiGetter = () => Api;


const loadArticles = (projectId: string, query: string | null, $top?: number, $skip?: number) => {
  return async (dispatch: (any) => any, getState: () => KnowledgeBaseState, getApi: ApiGetter) => {
    const api: Api = getApi();

    logEvent({message: 'Loading articles', analyticsId: ANALYTICS_ARTICLES_PAGE});

    dispatch(setLoading(true));
    const [error, articles] = await until(api.articles.get(query, $top, $skip));
    dispatch(setLoading(false));

    if (error) {
      dispatch(setError(error));
      logEvent({message: 'Failed to load articles', isError: true});
    } else {
      const tree: Array<ArticleNode> = createTree(articles);
      const articlesTree: ArticlesList = tree.filter(it => it.data.length > 0);
      dispatch(setTree(articlesTree));
    }
  };
};

export {
  loadArticles
};
