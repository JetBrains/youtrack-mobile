import {arrayToTree} from 'performant-array-to-tree';
import * as helper from './knowledge-base-helper';
import * as treeHelper from 'components/articles/articles-tree-helper';
import animation from 'components/animation/animation';
import {ANALYTICS_ARTICLES_PAGE} from 'components/analytics/analytics-ids';
import {confirmation} from 'components/confirmation/confirmation';
import {flushStoragePart, getStorageState} from 'components/storage/storage';
import {hasType} from 'components/api/api__resource-types';
import {i18n} from 'components/i18n/i18n';
import {logEvent} from 'components/log/log-helper';
import {notify, notifyError} from 'components/notification/notification';
import {
  setArticles,
  setError,
  setExpandingProjectId,
  setList,
} from './knowledge-base-reducers';
import {
  cacheProjects,
  cacheUserLastVisitedArticle,
  resetUserArticlesProfile,
  setGlobalInProgress,
} from 'actions/app-actions';
import {showActionSheet} from 'components/action-sheet/action-sheet';
import {sortByUpdatedReverse} from 'components/search/sorting';
import {until} from 'util/util';

import type Api from 'components/api/api';
import type {ActionSheetOption} from 'components/action-sheet/action-sheet';
import type {
  Article,
  ArticleNodeList,
  ArticleProject,
  ArticlesList,
  ArticlesListItem,
  ProjectArticlesData,
} from 'types/Article';
import type {ArticleDraft} from 'types/Article';
import type {AnyError} from 'types/Error';
import type {Folder} from 'types/User';
import type {ReduxAction, ReduxThunkDispatch, ReduxStateGetter, ReduxAPIGetter} from 'types/Redux';
import type {ShowActionSheetWithOptions} from 'components/action-sheet/action-sheet';

export const getCachedArticleList = (): ArticlesList =>
  getStorageState().articlesList || [];

const loadCachedArticleList = (): ReduxAction => async (dispatch: ReduxThunkDispatch) => {
  const cachedArticlesList: ArticlesList = getCachedArticleList();

  if (cachedArticlesList?.length > 0) {
    dispatch(setList(cachedArticlesList));
    logEvent({
      message: 'Set article list from cache',
    });
  }
};

const getArticlesQuery = (): string | null => getStorageState().articlesQuery;

const createArticleList = (articles: ProjectArticlesData[], isExpanded?: boolean): ArticlesList =>
  treeHelper.createArticleList(articles, isExpanded);


export const getPinnedNonTemplateProjects = async (
  api: Api,
): Promise<Array<Folder>> => {
  const [error, pinnedFolders] = await until<Folder[]>(api.issueFolder.getPinnedIssueFolder());
  if (error) {
    notifyError(error);
    return [];
  } else {
    return (pinnedFolders || [])
      .filter((it: Folder) => !it.template)
      .filter(hasType.project);
  }
};

const clearUserLastVisitedArticle = (): ReduxAction => async (dispatch: ReduxThunkDispatch) => {
  dispatch(resetUserArticlesProfile());
  cacheUserLastVisitedArticle(null);
};

const loadArticleList = (
  reset: boolean = true,
): ReduxAction => async (
  dispatch: ReduxThunkDispatch,
) => {
  const query: string | null = getArticlesQuery();

  if (query) {
    dispatch(filterArticles(query));
  } else {
    dispatch(getArticleList(reset));
  }
};

const getArticleList = (reset: boolean = true) => async (
  dispatch: ReduxThunkDispatch,
  getState: ReduxStateGetter,
  getApi: ReduxAPIGetter,
) => {
  const isOffline: boolean =
    getState().app?.networkState?.isConnected === false;

  if (isOffline) {
    const cachedArticles = getStorageState().articles;
    const cachedArticlesList = getStorageState().articlesList;

    if (cachedArticles && cachedArticlesList) {
      dispatch(setArticles(cachedArticles));
      dispatch(setList(cachedArticlesList));
    }

    return;
  }

  const api: Api = getApi();
  logEvent({
    message: 'Loading articles per project',
    analyticsId: ANALYTICS_ARTICLES_PAGE,
  });
  setError(null);

  if (reset) {
    dispatch(setGlobalInProgress(true));
  }

  const pinnedProjects: Folder[] = await getPinnedNonTemplateProjects(api);

  if (pinnedProjects.length === 0) {
    dispatch(setGlobalInProgress(false));
    dispatch(storeArticlesList(null));
    dispatch(
      setError({
        noFavoriteProjects: true,
      } as unknown as AnyError),
    );
  } else {
    const sortedProjects: ArticleProject[] = helper.createSortedProjects(
      pinnedProjects,
      getCachedArticleList(),
    );
    dispatch(setError(null));
    const [error, projectData] = await until<ProjectArticlesData[], AnyError | null>(
      getProjectDataPromises(api, sortedProjects)
    );
    dispatch(setGlobalInProgress(false));

    if (error) {
      dispatch(setError(error));
      notifyError(error);
    } else {
      logEvent({
        message: 'Pinned projects articles loaded',
      });
      const articlesList: ArticlesList = createArticleList(projectData);
      dispatch(storeProjectData(projectData));
      dispatch(storeArticlesList(articlesList));
    }
  }
};

const getArticleChildren = (articleId: string): ReduxAction<Promise<ArticleNodeList>> => async (
  dispatch: ReduxThunkDispatch,
  getState: ReduxStateGetter,
  getApi: ReduxAPIGetter,
) => {
  logEvent({
    message: 'Loading article children',
    analyticsId: ANALYTICS_ARTICLES_PAGE,
  });
  const [error, articleWithChildren] = await until(
    getApi().articles.getArticleChildren(articleId),
  );

  if (error) {
    logEvent({
      message: 'Failed to load article children',
      isError: true,
    });
    return arrayToTree([]) as ArticleNodeList;
  } else {
    logEvent({
      message: 'Article children loaded',
    });
    return arrayToTree(articleWithChildren.childArticles) as ArticleNodeList;
  }
};

const filterArticles = (
  query: string | null,
): ReduxAction => async (
  dispatch: ReduxThunkDispatch,
  getState: ReduxStateGetter,
  getApi: ReduxAPIGetter,
) => {
  logEvent({
    message: 'Filter articles',
    analyticsId: ANALYTICS_ARTICLES_PAGE,
  });
  flushStoragePart({
    articlesQuery: query ? query : null,
  });

  if (!query) {
    dispatch(loadArticleList(true));
  } else {
    setError(null);
    dispatch(setGlobalInProgress(true));
    const [error, articles] = await until<Article[]>(getApi().articles.getArticles(query));
    dispatch(setGlobalInProgress(false));

    if (error) {
      notifyError(error);
    } else {
      const projectData = helper.createProjectDataFromArticles(
        articles,
      );
      const articlesList: ArticlesList = createArticleList(projectData, true);
      dispatch(setList(articlesList));
    }
  }
};

const loadArticlesDrafts = (): ReduxAction<Promise<ArticleDraft[]>> => async (
  dispatch: ReduxThunkDispatch,
  getState: ReduxStateGetter,
  getApi: ReduxAPIGetter,
) => {
  const [error, articlesDrafts] = await until<ArticleDraft[]>(getApi().articles.getArticleDrafts());

  if (error) {
    notifyError(error);
    return [];
  } else {
    return articlesDrafts.sort(sortByUpdatedReverse);
  }
};

const toggleProjectVisibility = (
  item: ArticlesListItem,
): ReduxAction => async (
  dispatch: ReduxThunkDispatch,
  getState: ReduxStateGetter,
  getApi: ReduxAPIGetter,
) => {
  const api: Api = getApi();
  const {articles, articlesList} = getState().articles;
  logEvent({
    message: 'Toggle project article visibility',
    analyticsId: ANALYTICS_ARTICLES_PAGE,
  });

  if (!articlesList || !articles) {
    return;
  }

  setError(null);
  let updatedArticlesList: ArticlesList = articlesList.slice();
  const project = item.title;

  if (project?.articles?.collapsed === false) {
    return toggleProject(item, updatedArticlesList, true);
  }

  if (item.dataCollapsed) {
    toggleProject(item, updatedArticlesList, false);
  } else {
    dispatch(setExpandingProjectId(item.title?.id || null));
  }

  const updatedProjectData = await getUpdatedProjectData();
  dispatch(setExpandingProjectId(null));

  if (updatedProjectData) {
    dispatch(storeProjectData(updatedProjectData));
    updatedArticlesList = createArticleList(updatedProjectData);
  }

  dispatch(storeArticlesList(updatedArticlesList));

  function toggleProject(
    listItem: ArticlesListItem,
    updatedArticlesList: ArticlesList,
    isCollapsed: boolean,
  ) {
    const index: number = updatedArticlesList.findIndex(
      (it: ArticlesListItem) => it.title?.id === listItem.title?.id,
    );

    if (index >= 0) {
      updatedArticlesList.splice(
        index,
        1,
        treeHelper.toggleProject(listItem, isCollapsed),
      );
    }

    dispatch(storeArticlesList(updatedArticlesList));
    const projectData = (articles || []).reduce(
      (list: ProjectArticlesData[], it: ProjectArticlesData) =>
        list.concat(
          it.project.id === listItem.title?.id
            ? toggleProjectDataItem(it, isCollapsed)
            : it,
        ),
      [],
    );
    dispatch(storeProjectData(projectData));
  }

  async function getUpdatedProjectData(): Promise<ProjectArticlesData[] | null> {
    const [error, projectData] = await until<ProjectArticlesData[]>(
      getProjectDataPromises(api, [
        {...project, articles: {...project.articles, collapsed: false}},
      ]),
    );

    if (error) {
      notifyError(error);
    }

    return projectData && projectData[0] && articles
      ? helper.replaceProjectData(articles, projectData[0])
      : null;
  }
};

const toggleProjectFavorite = (
  item: ArticlesListItem,
): ReduxAction<Promise<boolean>> => async (
  dispatch: ReduxThunkDispatch,
  getState: ReduxStateGetter,
  getApi: ReduxAPIGetter,
) => {
  logEvent({
    message: 'Toggle project article favorite',
    analyticsId: ANALYTICS_ARTICLES_PAGE,
  });
  return confirmation(i18n('Remove project from favorites?'), i18n('Remove'))
    .then(async () => {
      const api: Api = getApi();
      const articles: ProjectArticlesData[] =
        getState().articles.articles || [];
      const prevArticles: ProjectArticlesData[] = articles.slice();
      animation.layoutAnimation();
      const project = item.title as ArticleProject;
      const updatedData: ProjectArticlesData[] = helper.removeProjectData(
        articles,
        project,
      );
      update(updatedData);
      const [error] = await until(
        api.projects.toggleFavorite(project.id, project.pinned),
      );

      if (error) {
        notifyError(error);
        update(prevArticles);
        return true;
      } else {
        const projects = await dispatch(cacheProjects());
        const hasPinned: boolean = projects.some(
          it => it.pinned,
        );

        if (!hasPinned) {
          update(null);
          dispatch(clearUserLastVisitedArticle());
        }

        return hasPinned;
      }
    })
    .catch(() => false);

  function update(data: ProjectArticlesData[] | null) {
    const hasData: boolean = data !== null && data?.length > 0;
    dispatch(storeProjectData(hasData ? data : null));
    dispatch(
      storeArticlesList(hasData ? data && createArticleList(data) : null),
    );

    if (!hasData) {
      dispatch(setNoFavoriteProjects());
    }
  }
};

const updateProjectsFavorites = (
  pinnedProjects: ArticleProject[],
  unpinnedProjects: ArticleProject[],
  hasNoFavorites: boolean,
): ReduxAction => async (
  dispatch: ReduxThunkDispatch,
  getState: ReduxStateGetter,
  getApi: ReduxAPIGetter,
) => {
  logEvent({
    message: 'Manage favorite projects',
    analyticsId: ANALYTICS_ARTICLES_PAGE,
  });
  dispatch(setError(null));
  dispatch(setGlobalInProgress(true));
  const [error] = await until(
    pinnedProjects
      .map((it: ArticleProject) => getApi().projects.addFavorite(it.id))
      .concat(
        unpinnedProjects.map((it: ArticleProject) =>
          getApi().projects.removeFavorite(it.id),
        ),
      ),
  );

  if (error) {
    notifyError(error);
  } else if (hasNoFavorites) {
    storeProjectData(null);
    storeArticlesList(null);
  }

  dispatch(cacheProjects());
};

const setNoFavoriteProjects = (): ReduxAction => async (dispatch: ReduxThunkDispatch) => {
  dispatch(setGlobalInProgress(false));
  dispatch(
    setError({
      noFavoriteProjects: true,
    }),
  );
};

const showContextActions = (
  showActionSheetWithOptions: ShowActionSheetWithOptions,
  canCreateArticle: boolean,
  onShowMoreProjects: (...args: any[]) => void,
  onCreateArticle: () => void,
): ReduxAction => async () => {
  const actions: ActionSheetOption[] = [
    {
      title: i18n('Manage Favorite Projects'),
      execute: onShowMoreProjects,
    },
    {
      title: i18n('Cancel'),
    },
  ];

  if (
    canCreateArticle &&
    (getStorageState().projects || []).some(it => it.pinned)
  ) {
    actions.unshift({
      title: i18n('New Article'),
      execute: onCreateArticle,
    });
  }

  const selectedAction = await showActionSheet(actions, showActionSheetWithOptions, '');

  if (selectedAction && selectedAction.execute) {
    selectedAction.execute();
  }
};

const toggleAllProjects = (
  collapse: boolean = true,
): ReduxAction => async (
  dispatch: ReduxThunkDispatch,
  getState: ReduxStateGetter,
) => {
  const {articles, articlesList} = getState().articles;
  logEvent({
    message: `${collapse ? 'Collapse' : 'Expand'} all Knowledge base projects`,
    analyticsId: ANALYTICS_ARTICLES_PAGE,
  });
  const updatedProjectData = (articles || []).reduce(
    (list: ProjectArticlesData[], item: ProjectArticlesData) =>
      list.concat(toggleProjectDataItem(item, true)),
    [],
  );
  dispatch(storeProjectData(updatedProjectData));
  const updatedArticlesList: ArticlesList = (articlesList || []).reduce(
    (list: ArticlesList, item: ArticlesListItem) =>
      list.concat(treeHelper.toggleProject(item, collapse)),
    [],
  );
  dispatch(storeArticlesList(updatedArticlesList));
  notify(
    `${collapse ? i18n('Projects collapsed') : i18n('Projects expanded')}`,
  );
};

export type KnowledgeBaseActions = {
  clearUserLastVisitedArticle: typeof clearUserLastVisitedArticle;
  updateProjectsFavorites: typeof updateProjectsFavorites;
  createList: typeof createArticleList;
  filterArticles: typeof filterArticles;
  getArticleChildren: typeof getArticleChildren;
  loadArticleList: typeof loadArticleList;
  loadArticlesDrafts: typeof loadArticlesDrafts;
  getArticlesQuery: typeof getArticlesQuery;
  loadCachedArticleList: typeof loadCachedArticleList;
  setNoFavoriteProjects: typeof setNoFavoriteProjects;
  showContextActions: typeof showContextActions;
  toggleAllProjects: typeof toggleAllProjects;
  toggleProjectFavorite: typeof toggleProjectFavorite;
  toggleProjectVisibility: typeof toggleProjectVisibility;
};
export {
  clearUserLastVisitedArticle,
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

async function setArticlesCache(
  articles: ProjectArticlesData[] | null | undefined,
) {
  await flushStoragePart({
    articles,
  });
}

async function setArticlesListCache(articlesList: ArticlesList | null) {
  await flushStoragePart({
    articlesList,
  });
}

function storeArticlesList(articlesList: ArticlesList | null) {
  return async (dispatch: ReduxThunkDispatch) => {
    dispatch(setList(articlesList));
    setArticlesListCache(articlesList);
  };
}

function storeProjectData(
  projectArticlesData: ProjectArticlesData[] | null,
) {
  return async (dispatch: ReduxThunkDispatch) => {
    dispatch(setArticles(projectArticlesData));
    await setArticlesCache(projectArticlesData);
  };
}

function getProjectDataPromises(
  api: Api,
  projects: ArticleProject[],
): Array<Promise<ProjectArticlesData>> {
  return projects.map(async (project: ArticleProject) => {
    if (project.articles.collapsed) {
      return {
        project,
        articles: [],
      };
    }

    const [error, articles] = await until<Article[]>(api.articles.getArticles(getArticlesQuery(), project.id));
    return {
      ...{project},
      articles: error ? [] : articles,
    };
  });
}

function toggleProjectDataItem(
  item: ProjectArticlesData,
  isCollapsed: boolean,
) {
  return {
    ...item,
    project: {
      ...item.project,
      articles: {...item.project.articles, collapsed: isCollapsed},
    },
  };
}
