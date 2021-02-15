/* @flow */

import {arrayToTree} from 'performant-array-to-tree';

import type ActionSheet from '@expo/react-native-action-sheet';

import * as helper from './knowledge-base-helper';
import * as treeHelper from '../../components/articles/articles-tree-helper';
import animation from '../../components/animation/animation';
import Router from '../../components/router/router';
import {ANALYTICS_ARTICLES_PAGE} from '../../components/analytics/analytics-ids';
import {confirmation} from '../../components/confirmation/confirmation';
import {flushStoragePart, getStorageState} from '../../components/storage/storage';
import {hasType} from '../../components/api/api__resource-types';
import {logEvent} from '../../components/log/log-helper';
import {notify} from '../../components/notification/notification';
import {setArticles, setError, setList, setLoading} from './knowledge-base-reducers';
import {cacheProjects, setUserLastVisitedArticle} from '../../actions/app-actions';
import {showActions} from '../../components/action-sheet/action-sheet';
import {sortByUpdatedReverse} from '../../components/search/sorting';
import {until} from '../../util/util';

import type Api from '../../components/api/api';
import type {ActionSheetOption} from '../../components/action-sheet/action-sheet';
import type {AppState} from '../../reducers';
import type {Article, ArticleProject, ArticlesList, ArticlesListItem, ProjectArticlesData} from '../../flow/Article';
import type {CustomError} from '../../flow/Error';
import type {Folder} from '../../flow/User';

type ApiGetter = () => Api;

export const getCachedArticleList = (): ArticlesList => getStorageState().articlesList || [];

const loadCachedArticleList = () => async (dispatch: (any) => any) => {
  const cachedArticlesList: ArticlesList = getCachedArticleList();
  if (cachedArticlesList?.length > 0) {
    dispatch(setList(cachedArticlesList));
    logEvent({message: 'Set article list from cache'});
  }
};

const getArticlesQuery = (): string | null => getStorageState().articlesQuery;

const createArticleList = (articles: Array<Article>, isExpanded?: boolean): ArticlesList => (
  treeHelper.createArticleList(articles, isExpanded)
);

export const getPinnedProjects = async (api: Api): Promise<Array<Folder>> => {
  const [error, pinnedFolders]: [?CustomError, Folder] = await until(api.issueFolder.getPinnedIssueFolder());
  if (error) {
    notify('Unable to load favorite projects', error);
    return [];
  } else {
    return pinnedFolders.filter(hasType.project);
  }
};

const loadArticleList = (reset: boolean = true) => async (dispatch: (any) => any) => {
  const query: string | null = getArticlesQuery();
  if (query) {
    dispatch(filterArticles(query));
  } else {
    dispatch(getArticleList(reset));
  }
};

const getArticleList = (reset: boolean = true) =>
  async (dispatch: (any) => any, getState: () => AppState, getApi: ApiGetter) => {
    const api: Api = getApi();

    logEvent({
      message: 'Loading articles per project',
      analyticsId: ANALYTICS_ARTICLES_PAGE
    });

    setError(null);
    dispatch(setUserLastVisitedArticle(null));

    if (reset) {
      dispatch(setLoading(true));
    }

    const pinnedProjects: Array<Folder> = await getPinnedProjects(api);
    if (pinnedProjects.length === 0) {
      dispatch(setLoading(false));
      dispatch(storeArticlesList(null));
      dispatch(setError({noFavoriteProjects: true}));
    } else {
      const sortedProjects: Array<ArticleProject> = helper.createSortedProjects(
        pinnedProjects,
        getCachedArticleList()
      );
      const [error, projectData]: [?CustomError, ProjectArticlesData] = await until(
        getProjectDataPromises(api, sortedProjects)
      );
      dispatch(setLoading(false));

      if (error) {
        dispatch(setError(error));
        const msg: string = 'Unable to load favorite projects articles';
        notify(msg, error);
        logEvent({message: msg, isError: true});
      } else {
        logEvent({message: 'Pinned projects articles loaded'});

        const articlesList: ArticlesList = createArticleList(projectData);
        dispatch(storeProjectData(projectData));
        dispatch(storeArticlesList(articlesList));
      }
    }
  };

const getArticleChildren = (articleId: string): ArticlesList =>
  async (dispatch: (any) => any, getState: () => AppState, getApi: ApiGetter) => {
    logEvent({message: 'Loading article children', analyticsId: ANALYTICS_ARTICLES_PAGE});
    const [error, articleWithChildren] = await until(getApi().articles.getArticleChildren(articleId));

    if (error) {
      logEvent({message: 'Failed to load article children', isError: true});
      return arrayToTree([]);
    } else {
      logEvent({message: 'Article children loaded'});
      return arrayToTree(articleWithChildren.childArticles);
    }
  };

const filterArticles = (query: string | null) =>
  async (dispatch: (any) => any, getState: () => AppState, getApi: ApiGetter) => {
    logEvent({
      message: 'Filter articles',
      analyticsId: ANALYTICS_ARTICLES_PAGE
    });

    flushStoragePart({articlesQuery: query ? query : null});

    if (!query) {
      return dispatch(loadArticleList(true));
    }

    setError(null);
    dispatch(setUserLastVisitedArticle(null));
    dispatch(setLoading(true));

    const [error, articles]: [?CustomError, Array<Article>] = await until(
      getApi().articles.getArticles(query)
    );
    dispatch(setLoading(false));

    if (error) {
      notify('Unable to filter articles', error);
      return;
    }

    const projectData: Array<ProjectArticlesData> = helper.createProjectDataFromArticles(articles);
    const articlesList: ArticlesList = createArticleList(projectData, true);
    dispatch(setList(articlesList));
  };

const loadArticlesDrafts = () => async (dispatch: (any) => any, getState: () => AppState, getApi: ApiGetter) => {
  const api: Api = getApi();

  const [error, articlesDrafts] = await until(api.articles.getArticleDrafts());

  if (error) {
    notify('Unable to load article drafts', error);
    return [];
  } else {
    return articlesDrafts.sort(sortByUpdatedReverse);
  }
};

const toggleProjectVisibility = (item: ArticlesListItem) =>
  async (dispatch: (any) => any, getState: () => AppState, getApi: ApiGetter) => {
    const api: Api = getApi();
    const {articles, articlesList} = getState().articles;

    logEvent({
      message: 'Toggle project article visibility',
      analyticsId: ANALYTICS_ARTICLES_PAGE
    });

    if (!articlesList || !articles) {
      return;
    }

    setError(null);
    let updatedArticlesList: ArticlesList = articlesList.slice();
    const project: ArticleProject = item.title;

    if (project.articles.collapsed === false) {
      return toggleProject(item, updatedArticlesList, true);
    }

    if (item.dataCollapsed) {
      toggleProject(item, updatedArticlesList, false);
    }
    const updatedProjectData: ProjectArticlesData | null = await getUpdatedProjectData();
    if (updatedProjectData) {
      dispatch(storeProjectData(updatedProjectData));
      updatedArticlesList = createArticleList(updatedProjectData);
    }

    dispatch(storeArticlesList(updatedArticlesList));


    function toggleProject(listItem: ArticlesListItem, updatedArticlesList: ArticlesList, isCollapsed: boolean) {
      const index: number = updatedArticlesList.findIndex(
        (it: ArticlesListItem) => it.title.id === listItem.title.id
      );
      if (index >= 0) {
        updatedArticlesList.splice(index, 1, treeHelper.toggleProject(listItem, isCollapsed));
      }
      dispatch(storeArticlesList(updatedArticlesList));

      const updatedProjectData: ArticlesList = articles.reduce(
        (list: Array<ProjectArticlesData>, it: ProjectArticlesData) => list.concat(
          it.project.id === listItem.title.id ? toggleProjectDataItem(it, isCollapsed) : it),
        []
      );
      dispatch(storeProjectData(updatedProjectData));
    }

    async function getUpdatedProjectData(): ProjectArticlesData | null {
      const [error, projectData] = await until(
        getProjectDataPromises(
          api,
          [{
            ...project,
            articles: {
              ...project.articles,
              collapsed: false
            }
          }]
        )
      );

      if (error) {
        notify('Unable to load project articles', error);
      }
      return projectData && projectData[0] ? helper.replaceProjectData(articles, projectData[0]) : null;
    }
  };

const toggleProjectFavorite = (item: ArticlesListItem) =>
  async (dispatch: (any) => any, getState: () => AppState, getApi: ApiGetter) => {
    logEvent({
      message: 'Toggle project article favorite',
      analyticsId: ANALYTICS_ARTICLES_PAGE
    });
    confirmation(
      'Remove project from favorites?',
      'Remove',
    )
      .then(async () => {
        const api: Api = getApi();
        const articles: Array<ProjectArticlesData> = getState().articles.articles || [];
        const prevArticles: Array<ProjectArticlesData> = articles.slice();

        animation.layoutAnimation();
        const updatedData: Array<ProjectArticlesData> = helper.removeProjectData(articles, item.title);
        update(updatedData);

        const [error] = await until(api.projects.toggleFavorite(item.title.id, item.title.pinned));
        if (error) {
          notify('Failed to toggle favorite for the project', error);
          update(prevArticles);
        } else {
          const projects: Array<ArticleProject> = await dispatch(cacheProjects());
          const hasPinned: boolean = projects.some((it: ArticleProject) => it.pinned);
          if (!hasPinned) {
            update(null);
          }
        }
      }).catch(() => {});


    function update(data: Array<ProjectArticlesData> | null) {
      const hasData: boolean = data !== null && data?.length > 0;
      dispatch(storeProjectData(hasData ? data : null));
      dispatch(storeArticlesList(hasData ? data && createArticleList(data) : null));
      if (!hasData) {
        dispatch(setNoFavoriteProjects());
      }
    }
  };

const updateProjectsFavorites = (
  pinnedProjects: Array<ArticleProject>,
  unpinnedProjects: Array<ArticleProject>,
  hasNoFavorites: boolean
) =>
  async (dispatch: (any) => any, getState: () => AppState, getApi: ApiGetter) => {
    const api: Api = getApi();
    logEvent({
      message: 'Manage favorite projects',
      analyticsId: ANALYTICS_ARTICLES_PAGE
    });

    dispatch(setError(null));
    dispatch(setLoading(true));

    const [error] = await until(
      pinnedProjects.map((it: ArticleProject) => api.projects.addFavorite(it.id))
        .concat(
          unpinnedProjects.map((it: ArticleProject) => api.projects.removeFavorite(it.id))
        )
    );
    if (error) {
      notify(`Failed to change favorites`, error);
    } else if (hasNoFavorites) {
      storeProjectData(null);
      storeArticlesList(null);
    }
    dispatch(cacheProjects());
  };

const setNoFavoriteProjects = () => async (dispatch: (any) => any) => {
  dispatch(setLoading(false));
  dispatch(setError({noFavoriteProjects: true}));
};

const showContextActions = (actionSheet: ActionSheet, canCreateArticle: boolean, onShowMoreProjects: Function) =>
  async () => {
    const actions: Array<ActionSheetOption> = [
      {
        title: 'Manage Favorite Projects',
        execute: onShowMoreProjects
      },
      {title: 'Cancel'}
    ];

    if (canCreateArticle) {
      actions.unshift({
        title: 'New Article',
        execute: () => Router.ArticleCreate({isNew: true})
      });
    }

    const selectedAction: ?ActionSheetOption = await showActions(actions, actionSheet);

    if (selectedAction && selectedAction.execute) {
      selectedAction.execute();
    }
  };

const toggleAllProjects = (collapse: boolean = true) =>
  async (dispatch: (any) => any, getState: () => AppState) => {
    const {articles, articlesList} = getState().articles;
    logEvent({
      message: `${collapse ? 'Collapse' : 'Expand'} all Knowledge base projects`,
      analyticsId: ANALYTICS_ARTICLES_PAGE
    });
    const updatedProjectData: ArticlesList = (articles || []).reduce(
      (list: Array<ProjectArticlesData>, item: ProjectArticlesData) => (
        list.concat(toggleProjectDataItem(item, true))
      ), []);
    dispatch(storeProjectData(updatedProjectData));

    const updatedArticlesList: ArticlesList = (articlesList || []).reduce((list: ArticlesList, item: ArticlesListItem) => (
      list.concat(treeHelper.toggleProject(item, collapse))
    ), []);
    dispatch(storeArticlesList(updatedArticlesList));
    notify(`${collapse ? 'Projects collapsed' : 'Projects expanded'}`);
  };

export type KnowledgeBaseActions = {
  updateProjectsFavorites: typeof updateProjectsFavorites,
  createList: typeof createArticleList,
  filterArticles: typeof filterArticles,
  getArticleChildren: typeof getArticleChildren,
  loadArticleList: typeof loadArticleList,
  loadArticlesDrafts: typeof loadArticlesDrafts,
  getArticlesQuery: typeof getArticlesQuery,
  loadCachedArticleList: typeof loadCachedArticleList,
  setNoFavoriteProjects: typeof setNoFavoriteProjects,
  showContextActions: typeof showContextActions,
  toggleAllProjects: typeof toggleAllProjects,
  toggleProjectFavorite: typeof toggleProjectFavorite,
  toggleProjectVisibility: typeof toggleProjectVisibility,
};

export {
  updateProjectsFavorites,
  createArticleList,
  filterArticles,
  getArticleChildren,
  loadArticleList,
  loadArticlesDrafts,
  getArticlesQuery,
  loadCachedArticleList,
  setNoFavoriteProjects,
  showContextActions,
  toggleAllProjects,
  toggleProjectFavorite,
  toggleProjectVisibility,
};

async function setArticlesCache(articles: ?Array<ProjectArticlesData>) {
  await flushStoragePart({articles});
}

async function setArticlesListCache(articlesList: ArticlesList) {
  await flushStoragePart({articlesList});
}


function storeArticlesList(articlesList: ArticlesList) {
  return async (dispatch: (any) => any) => {
    dispatch(setList(articlesList));
    setArticlesListCache(articlesList);
  };
}

function storeProjectData(projectArticlesData: Array<ProjectArticlesData> | null) {
  return async (dispatch: (any) => any) => {
    dispatch(setArticles(projectArticlesData));
    await setArticlesCache(projectArticlesData);
  };
}

function getProjectDataPromises(api: Api, projects: Array<ArticleProject>): Array<Promise<ProjectArticlesData>> {
  return projects.map(async (project: ArticleProject) => {
    if (project.articles.collapsed === true) {
      return {
        ...{project},
        articles: []
      };
    }

    const [error, articles]: [?CustomError, ProjectArticlesData] = await until(
      api.articles.getArticles(getArticlesQuery(), project.id)
    );
    return {
      ...{project},
      articles: error ? [] : articles
    };
  });
}

function toggleProjectDataItem(item:ProjectArticlesData, isCollapsed: boolean) {
  return {
    ...item,
    project: {
      ...item.project,
      articles: {
        ...item.project.articles,
        collapsed: isCollapsed
      }
    }
  };
}
