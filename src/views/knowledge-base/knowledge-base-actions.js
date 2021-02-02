/* @flow */

import type ActionSheet from '@expo/react-native-action-sheet';

import * as articleTreeHelper from '../../components/articles/articles-tree-helper';
import animation from '../../components/animation/animation';
import Router from '../../components/router/router';
import {ANALYTICS_ARTICLES_PAGE} from '../../components/analytics/analytics-ids';
import {flushStoragePart, getStorageState} from '../../components/storage/storage';
import {logEvent} from '../../components/log/log-helper';
import {notify} from '../../components/notification/notification';
import {setArticles, setError, setList, setLoading} from './knowledge-base-reducers';
import {setUserLastVisitedArticle} from '../../actions/app-actions';
import {showActions} from '../../components/action-sheet/action-sheet';
import {sortByUpdatedReverse} from '../../components/search/sorting';
import {until} from '../../util/util';

import type Api from '../../components/api/api';
import type {ActionSheetOption} from '../../components/action-sheet/action-sheet';
import type {AppState} from '../../reducers';
import type {Article, ArticleProject, ArticlesList, ArticlesListItem} from '../../flow/Article';
import type {IssueProject} from '../../flow/CustomFields';

type ApiGetter = () => Api;


const setArticlesCache = async (articles: Array<Article>) => {
  flushStoragePart({articles});
};

const setArticlesListCache = async (articlesList: ArticlesList) => {
  await flushStoragePart({articlesList});
};

const getCachedArticleList = (): ArticlesList => getStorageState().articlesList || [];

const loadArticlesListFromCache = () => {
  return async (dispatch: (any) => any) => {
    const cachedArticlesList: ArticlesList = getCachedArticleList();
    if (cachedArticlesList?.length > 0) {
      dispatch(setList(cachedArticlesList));
      logEvent({message: 'Set article list from cache'});
    }
  };
};

const createArticleList = (
  articles: Array<Article>,
  cachedArticlesList: ArticlesList | null,
  flat?: boolean,
  isCollapsed?: boolean
): ArticlesList => {
  return articleTreeHelper.createArticleList(articles, cachedArticlesList, flat, isCollapsed);
};

const updateArticlesList = (articlesList: ArticlesList) => {
  return async (dispatch: (any) => any) => {
    dispatch(setList(articlesList));
    setArticlesListCache(articlesList);
  };
};

const updateArticles = (articles: Array<Article>) => {
  return async (dispatch: (any) => any) => {
    dispatch(setArticles(articles));
    setArticlesCache(articles);
  };
};

const loadArticlesList = (reset: boolean = true) => {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: ApiGetter) => {
    dispatch(setUserLastVisitedArticle(null));

    if (reset) {
      dispatch(setLoading(true));
    }

    logEvent({message: 'Loading articles', analyticsId: ANALYTICS_ARTICLES_PAGE});
    const [error, articles] = await until(getApi().articles.get());
    dispatch(setLoading(false));

    if (error) {
      logEvent({message: 'Failed to load articles', isError: true});
      dispatch(setError(error));
    } else {
      logEvent({message: 'Articles loaded'});
      dispatch(updateArticles(articles));

      const articlesList: ArticlesList = createFilteredArticlesList(articles, getArticlesQuery());
      dispatch(updateArticlesList(articlesList));
    }
  };
};

const createFilteredArticlesList = (articles: Array<Article>, query: string | null): ArticlesList => {
  let filteredArticlesList: ArticlesList;
  if (query) {
    const filteredArticles: Array<Article> = articleTreeHelper.doFilterArticles(articles, query);
    filteredArticlesList = createArticleList(filteredArticles, null, true, false);
  } else {
    filteredArticlesList = createArticleList(articles, getCachedArticleList());
  }
  return filteredArticlesList;
};

const filterArticles = (query: string) => {
  return async (dispatch: (any) => any, getState: () => AppState) => {
    const articles: Array<Article> = getState().articles.articles || [];
    flushStoragePart({articlesQuery: query ? query : null});

    const articlesList: ArticlesList = createFilteredArticlesList(articles, query);
    dispatch(setList(articlesList));
  };
};

const getArticlesQuery = (): string | null => getStorageState().articlesQuery;

const loadArticlesDrafts = () => {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: ApiGetter) => {
    const api: Api = getApi();

    const [error, articlesDrafts] = await until(api.articles.getArticleDrafts());

    if (error) {
      logEvent({message: 'Failed to load article drafts', isError: true});
      return [];
    } else {
      return articlesDrafts.sort(sortByUpdatedReverse);
    }
  };
};

const toggleProjectArticlesVisibility = (section: ArticlesListItem) => {
  return async (dispatch: (any) => any, getState: () => AppState) => {
    logEvent({message: 'Toggle project article visibility', analyticsId: ANALYTICS_ARTICLES_PAGE});

    const state: AppState = getState();
    const {articlesList} = state.articles;

    if (articlesList) {
      const updatedArticlesList: ArticlesList = articlesList.reduce((list: ArticlesList, item: ArticlesListItem) => {
        const project: ArticleProject = item.title;
        let i: ArticlesListItem | null;

        if (project.id === section.title.id) {
          i = articleTreeHelper.toggleArticleProjectListItem(section);
        } else {
          i = item;
        }
        return list.concat(i);
      }, []);

      dispatch(updateArticlesList(updatedArticlesList));
    }
  };
};

const toggleProjectArticlesFavorite = (project: ArticleProject) => {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: ApiGetter) => {
    logEvent({message: 'Toggle project article favorite', analyticsId: ANALYTICS_ARTICLES_PAGE});
    const api: Api = getApi();

    animation.layoutAnimation();
    update();
    const [error] = await until(api.projects.toggleFavorite(project.id, project.pinned));
    if (error) {
      notify('Failed to toggle favorite for the project', error);
      update();
    }

    async function update() {
      const updatedProjects = getStorageState().projects.reduce((list: Array<IssueProject>, it: IssueProject) => {
        if (it.id === project.id) {
          it.pinned = !project.pinned;
        }
        return list.concat(it);
      }, []);

      await flushStoragePart({projects: updatedProjects});
      const articlesList: ArticlesList = getState().articles.articlesList || [];
      const articles: Array<Article> = articleTreeHelper.flattenArticleList(articlesList);
      dispatch(updateArticlesList(createArticleList(articles, getCachedArticleList())));
    }
  };
};

const toggleNonFavoriteProjectsVisibility = () => {
  return async (dispatch: (any) => any) => {
    const isPinnedOnly: boolean = getStorageState().articlesListPinnedOnly;
    await flushStoragePart({articlesListPinnedOnly: !isPinnedOnly});
    dispatch(loadArticlesList(true));
    notify(`${!isPinnedOnly ? 'Showing only favorite projects' : 'Showing all projects'}`);
  };
};

const showContextActions = (actionSheet: ActionSheet, canCreateArticle: boolean) => {
  return async (dispatch: (any) => any) => {
    const actions: Array<ActionSheetOption> = [
      {
        title: 'Show/Hide More Projects',
        execute: () => dispatch(toggleNonFavoriteProjectsVisibility())
      },
      {title: 'Cancel'}
    ];

    if (canCreateArticle) {
      actions.unshift({
        title: 'New Article',
        execute: () => Router.ArticleCreate()
      });
    }

    const selectedAction: ?ActionSheetOption = await showActions(actions, actionSheet);

    if (selectedAction && selectedAction.execute) {
      selectedAction.execute();
    }
  };
};

const toggleAllProjects = (collapse: boolean) => {
  return async (dispatch: (any) => any, getState: () => AppState) => {
    const state: AppState = getState();
    const {articlesList} = state.articles;
    logEvent({
      message: `${collapse ? 'Collapse' : 'Expand'} all Knowledge base projects`,
      analyticsId: ANALYTICS_ARTICLES_PAGE
    });
    if (articlesList) {
      const updatedArticlesList: ArticlesList = articlesList.reduce((list: ArticlesList, item: ArticlesListItem) => {
        return list.concat(articleTreeHelper.toggleArticleProjectListItem(item, collapse));
      }, []);

      dispatch(setList(updatedArticlesList));
      setArticlesListCache(updatedArticlesList);
      notify(`${collapse ? 'Projects collapsed' : 'Projects expanded'}`);
    }

  };
};

export type KnowledgeBaseActions = {
  createList: typeof createArticleList,
  getArticlesQuery: typeof getArticlesQuery,
  filterArticles: typeof filterArticles,
  loadArticlesDrafts: typeof loadArticlesDrafts,
  loadArticlesList: typeof loadArticlesList,
  loadArticlesListFromCache: typeof loadArticlesListFromCache,
  showContextActions: typeof showContextActions,
  toggleAllProjects: typeof toggleAllProjects,
  toggleNonFavoriteProjectsVisibility: typeof toggleNonFavoriteProjectsVisibility,
  toggleProjectArticlesFavorite: typeof toggleProjectArticlesFavorite,
  toggleProjectArticlesVisibility: typeof toggleProjectArticlesVisibility,
};

export {
  createArticleList,
  getArticlesQuery,
  filterArticles,
  loadArticlesDrafts,
  loadArticlesList,
  loadArticlesListFromCache,
  showContextActions,
  toggleAllProjects,
  toggleNonFavoriteProjectsVisibility,
  toggleProjectArticlesFavorite,
  toggleProjectArticlesVisibility,
};
