/* @flow */

import {ANALYTICS_ARTICLES_PAGE} from '../../components/analytics/analytics-ids';
import {createTree, toggleArticleProjectListItem} from '../../components/articles/articles-helper';
import {flushStoragePart, getStorageState} from '../../components/storage/storage';
import {logEvent} from '../../components/log/log-helper';
import {notify} from '../../components/notification/notification';
import {setError, setLoading, setList} from './knowledge-base-reducers';
import {until} from '../../util/util';

import type Api from '../../components/api/api';
import type {AppState} from '../../reducers';
import type {ArticleNode, ArticleProject, ArticlesList, ArticlesListItem} from '../../flow/Article';
import type {IssueProject} from '../../flow/CustomFields';

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
  return async (dispatch: (any) => any, getState: () => AppState, getApi: ApiGetter) => {
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
      const tree: Array<ArticleNode> = createTree(articles, getStorageState().articlesList);
      const articlesList: ArticlesList = tree.filter(it => it.data?.length > 0 || it.dataCollapsed?.length > 0);
      dispatch(setList(articlesList));
      setArticlesListCache(articlesList);
    }
  };
};

const toggleProjectArticlesVisibility = (section: ArticlesListItem) => {
  return async (dispatch: (any) => any, getState: () => AppState) => {
    logEvent({message: 'Toggle project articles visibility', analyticsId: ANALYTICS_ARTICLES_PAGE});

    const state: AppState = getState();
    const {articlesList} = state.articles;

    if (articlesList) {
      const updatedArticlesList: ArticlesList = articlesList.reduce((list: ArticlesList, item: ArticlesListItem) => {
        const project: ArticleProject = item.title;
        let i: ArticlesListItem | null;

        if (project.id === section.title.id) {
          i = toggleArticleProjectListItem(section);
        } else {
          i = item;
        }
        return list.concat(i);
      }, []);

      dispatch(setList(updatedArticlesList));
      setArticlesListCache(updatedArticlesList);
    }
  };
};

const toggleProjectArticlesFavorite = (project: ArticleProject) => {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: ApiGetter) => {
    logEvent({message: 'Toggle project articles favorite', analyticsId: ANALYTICS_ARTICLES_PAGE});
    const api: Api = getApi();
    const [error] = await until(api.projects.toggleFavorite(project.id, project.pinned));
    if (error) {
      notify('Failed to toggle favorite for the project', error);
    } else {
      const updatedProjects = getStorageState().projects.reduce((list: Array<IssueProject>, it: IssueProject) => {
        if (it.id === project.id) {
          it.pinned = !project.pinned;
        }
        return list.concat(it);
      }, []);

      await flushStoragePart({projects: updatedProjects});
      dispatch(loadArticlesList(false));
    }
  };
};

export type KnowledgeBaseActions = {
  loadArticlesList: typeof loadArticlesList,
  loadArticlesListFromCache: typeof loadArticlesListFromCache,
  toggleProjectArticlesVisibility: typeof toggleProjectArticlesVisibility,
  toggleProjectArticlesFavorite: typeof toggleProjectArticlesFavorite
};

export {
  loadArticlesList,
  loadArticlesListFromCache,
  toggleProjectArticlesVisibility,
  toggleProjectArticlesFavorite
};
