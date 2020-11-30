/* @flow */

import {arrayToTree} from 'performant-array-to-tree';

import log from '../../components/log/log';
import usage from '../../components/usage/usage';
import {getStorageState} from '../../components/storage/storage';
import {groupByFavoritesAlphabetically, sortByOrdinal} from '../../components/search/sorting';
import {until} from '../../util/util';

import {setLoading, setError, setTree} from './articles-reducers';

import type Api from '../../components/api/api';
import type {ArticlesState} from './articles-reducers';
import type {Folder} from '../../flow/User';
import type {Article} from '../../flow/Article';
import type {IssueProject} from '../../flow/CustomFields';

type ApiGetter = () => Api;
type Tree = Array<{
  title: IssueProject,
  data: Array<Article>
}>;

export const ARTICLE_ANALYTICS_ID = 'Articles';

const logEvent = ({message, isError, useAnalytics}: { message: string, isError?: boolean, useAnalytics?: boolean }): void => {
  log[isError ? 'warn' : 'log'](message);
  useAnalytics && usage.trackEvent(ARTICLE_ANALYTICS_ID, message);
};

const getGroupedProjects = (): Array<Folder> => {
  const projects: Array<Folder> = getStorageState().projects;
  return groupByFavoritesAlphabetically(projects, 'pinned');
};


const loadArticles = (projectId: string, query: string | null, $top?: number, $skip?: number) => {
  return async (dispatch: (any) => any, getState: () => ArticlesState, getApi: ApiGetter) => {
    const api: Api = getApi();

    logEvent({message: 'Loading articles', useAnalytics: true});

    dispatch(setLoading(true));
    const [error, articles] = await until(api.articles.get(query, $top, $skip));
    dispatch(setLoading(false));

    if (error) {
      dispatch(setError(error));
      logEvent({message: 'Failed to load articles', isError: true});
    } else {
      const tree = getGroupedProjects().reduce((model, project) => {
        const projectArticles = articles
          .filter((it: Article) => it.project.id === project.id)
          .sort(sortByOrdinal)
          .map((it: Article) => ({...it, parentId: it?.parentArticle?.id}));

        model.push({
          title: project,
          data: arrayToTree(projectArticles)
        });
        return model;
      }, []);

      const articlesTree: Tree = tree.filter(it => it.data.length > 0);

      dispatch(setTree(articlesTree));
    }
  };
};

export {
  loadArticles
};
