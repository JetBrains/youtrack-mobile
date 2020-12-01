/* @flow */

import {arrayToTree} from 'performant-array-to-tree';

import {ANALYTICS_ARTICLES_PAGE} from '../../components/analytics/analytics-ids';
import {getStorageState} from '../../components/storage/storage';
import {groupByFavoritesAlphabetically, sortByOrdinal} from '../../components/search/sorting';
import {logEvent} from '../../components/log/log-helper';
import {setError, setLoading, setTree} from './articles-reducers';
import {until} from '../../util/util';

import type Api from '../../components/api/api';
import type {ArticlesState} from './articles-reducers';
import type {Article} from '../../flow/Article';
import type {Folder} from '../../flow/User';
import type {IssueProject} from '../../flow/CustomFields';

type ApiGetter = () => Api;
type Tree = Array<{
  title: IssueProject,
  data: Array<Article>
}>;


const getGroupedProjects = (): Array<Folder> => {
  const projects: Array<Folder> = getStorageState().projects;
  return groupByFavoritesAlphabetically(projects, 'pinned');
};


const loadArticles = (projectId: string, query: string | null, $top?: number, $skip?: number) => {
  return async (dispatch: (any) => any, getState: () => ArticlesState, getApi: ApiGetter) => {
    const api: Api = getApi();

    logEvent({message: 'Loading articles', analyticsId: ANALYTICS_ARTICLES_PAGE});

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
