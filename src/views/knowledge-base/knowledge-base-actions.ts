import {arrayToTree} from 'performant-array-to-tree';
import type ActionSheet from '@expo/react-native-action-sheet';
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
} from 'actions/app-actions';
import {SET_PROGRESS} from '../../actions/action-types';
import {showActions} from 'components/action-sheet/action-sheet';
import {sortByUpdatedReverse} from 'components/search/sorting';
import {until} from 'util/util';
import type Api from 'components/api/api';
import type {ActionSheetOption} from 'components/action-sheet/action-sheet';
import type {AppState} from '../../reducers';
import type {
  Article,
  ArticleNodeList,
  ArticleProject,
  ArticlesList,
  ArticlesListItem,
  ProjectArticlesData,
} from 'flow/Article';
import type {CustomError} from 'flow/Error';
import type {Folder} from 'flow/User';
type ApiGetter = () => Api;
export const getCachedArticleList = (): ArticlesList =>
  getStorageState().articlesList || [];

const loadCachedArticleList = (): ((
  dispatch: (arg0: any) => any,
) => Promise<void>) => async (dispatch: (arg0: any) => any) => {
  const cachedArticlesList: ArticlesList = getCachedArticleList();

  if (cachedArticlesList?.length > 0) {
    dispatch(setList(cachedArticlesList));
    logEvent({
      message: 'Set article list from cache',
    });
  }
};

const getArticlesQuery = (): string | null => getStorageState().articlesQuery;

const createArticleList = (
  articles: Array<Article>,
  isExpanded?: boolean,
): ArticlesList => treeHelper.createArticleList(articles, isExpanded);

const setLoading = isInProgress => ({
  type: SET_PROGRESS,
  isInProgress,
});

export const getPinnedNonTemplateProjects = async (
  api: Api,
): Promise<Array<Folder>> => {
  const [error, pinnedFolders]: [
    CustomError | null | undefined,
    Folder,
  ] = await until(api.issueFolder.getPinnedIssueFolder());

  if (error) {
    notifyError(error);
    return [];
  } else {
    return ((pinnedFolders as any) as Array<Folder>)
      .filter((it: Folder) => !it.template)
      .filter(hasType.project);
  }
};

const clearUserLastVisitedArticle = (): ((
  dispatch: (arg0: any) => any,
) => Promise<void>) => async (dispatch: (arg0: any) => any) => {
  dispatch(resetUserArticlesProfile());
  cacheUserLastVisitedArticle(null);
};

const loadArticleList = (
  reset: boolean = true,
): ((dispatch: (arg0: any) => any) => Promise<void>) => async (
  dispatch: (arg0: any) => any,
) => {
  const query: string | null = getArticlesQuery();

  if (query) {
    dispatch(filterArticles(query));
  } else {
    dispatch(getArticleList(reset));
  }
};

const getArticleList = (reset: boolean = true) => async (
  dispatch: (arg0: any) => any,
  getState: () => AppState,
  getApi: ApiGetter,
) => {
  const isOffline: boolean =
    getState().app?.networkState?.isConnected === false;

  if (isOffline) {
    const cachedProjectData:
      | Array<ProjectArticlesData>
      | null
      | undefined = getStorageState().articles;
    const cachedArticlesList:
      | ArticlesList
      | null
      | undefined = getStorageState().articlesList;

    if (cachedProjectData && cachedArticlesList) {
      dispatch(setArticles(cachedProjectData));
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
    dispatch(setLoading(true));
  }

  const pinnedProjects: Array<Folder> = await getPinnedNonTemplateProjects(api);

  if (pinnedProjects.length === 0) {
    dispatch(setLoading(false));
    dispatch(storeArticlesList(null));
    dispatch(
      setError({
        noFavoriteProjects: true,
      }),
    );
  } else {
    const sortedProjects: Array<ArticleProject> = helper.createSortedProjects(
      pinnedProjects,
      getCachedArticleList(),
    );
    const [error, projectData]: [
      CustomError | null | undefined,
      ProjectArticlesData,
    ] = await until(getProjectDataPromises(api, sortedProjects));
    dispatch(setLoading(false));
    dispatch(setError(error || null));

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

const getArticleChildren: (
  articleId: string,
) => (
  dispatch: (arg0: any) => any,
  getState: () => AppState,
  getApi: ApiGetter,
) => Promise<ArticleNodeList> = (articleId: string) => async (
  dispatch: (arg0: any) => any,
  getState: () => AppState,
  getApi: ApiGetter,
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
    return arrayToTree([]);
  } else {
    logEvent({
      message: 'Article children loaded',
    });
    return arrayToTree(articleWithChildren.childArticles);
  }
};

const filterArticles = (
  query: string | null,
): ((
  dispatch: (arg0: any) => any,
  getState: () => AppState,
  getApi: ApiGetter,
) => Promise<void>) => async (
  dispatch: (arg0: any) => any,
  getState: () => AppState,
  getApi: ApiGetter,
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
    dispatch(setLoading(true));
    const [error, articles]: [
      CustomError | null | undefined,
      Array<Article>,
    ] = await until(getApi().articles.getArticles(query));
    dispatch(setLoading(false));

    if (error) {
      notifyError(error);
    } else {
      const projectData: Array<ProjectArticlesData> = helper.createProjectDataFromArticles(
        articles,
      );
      const articlesList: ArticlesList = createArticleList(projectData, true);
      dispatch(setList(articlesList));
    }
  }
};

const loadArticlesDrafts = (): ((
  dispatch: (arg0: any) => any,
  getState: () => AppState,
  getApi: ApiGetter,
) => Promise<any> | Promise<Array<any>>) => async (
  dispatch: (arg0: any) => any,
  getState: () => AppState,
  getApi: ApiGetter,
) => {
  const api: Api = getApi();
  const [error, articlesDrafts] = await until(api.articles.getArticleDrafts());

  if (error) {
    notifyError(error);
    return [];
  } else {
    return articlesDrafts.sort(sortByUpdatedReverse);
  }
};

const toggleProjectVisibility = (
  item: ArticlesListItem,
): ((
  dispatch: (arg0: any) => any,
  getState: () => AppState,
  getApi: ApiGetter,
) => Promise<void>) => async (
  dispatch: (arg0: any) => any,
  getState: () => AppState,
  getApi: ApiGetter,
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
  const project: ArticleProject = item.title;

  if (project.articles.collapsed === false) {
    return toggleProject(item, updatedArticlesList, true);
  }

  if (item.dataCollapsed) {
    toggleProject(item, updatedArticlesList, false);
  } else {
    dispatch(setExpandingProjectId(item.title?.id));
  }

  const updatedProjectData: ProjectArticlesData | null = await getUpdatedProjectData();
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
    const updatedProjectData: ArticlesList = articles.reduce(
      (list: Array<ProjectArticlesData>, it: ProjectArticlesData) =>
        list.concat(
          it.project.id === listItem.title.id
            ? toggleProjectDataItem(it, isCollapsed)
            : it,
        ),
      [],
    );
    dispatch(storeProjectData(updatedProjectData));
  }

  async function getUpdatedProjectData(): ProjectArticlesData | null {
    const [error, projectData] = await until(
      getProjectDataPromises(api, [
        {...project, articles: {...project.articles, collapsed: false}},
      ]),
    );

    if (error) {
      notifyError(error);
    }

    return projectData && projectData[0]
      ? helper.replaceProjectData(articles, projectData[0])
      : null;
  }
};

const toggleProjectFavorite = (
  item: ArticlesListItem,
): ((
  dispatch: (arg0: any) => any,
  getState: () => AppState,
  getApi: ApiGetter,
) => Promise<void>) => async (
  dispatch: (arg0: any) => any,
  getState: () => AppState,
  getApi: ApiGetter,
) => {
  logEvent({
    message: 'Toggle project article favorite',
    analyticsId: ANALYTICS_ARTICLES_PAGE,
  });
  return confirmation(i18n('Remove project from favorites?'), i18n('Remove'))
    .then(async () => {
      const api: Api = getApi();
      const articles: Array<ProjectArticlesData> =
        getState().articles.articles || [];
      const prevArticles: Array<ProjectArticlesData> = articles.slice();
      animation.layoutAnimation();
      const updatedData: Array<ProjectArticlesData> = helper.removeProjectData(
        articles,
        item.title,
      );
      update(updatedData);
      const [error] = await until(
        api.projects.toggleFavorite(item.title.id, item.title.pinned),
      );

      if (error) {
        notifyError(error);
        update(prevArticles);
        return true;
      } else {
        const projects: Array<ArticleProject> = await dispatch(cacheProjects());
        const hasPinned: boolean = projects.some(
          (it: ArticleProject) => it.pinned,
        );

        if (!hasPinned) {
          update(null);
          dispatch(clearUserLastVisitedArticle());
        }

        return hasPinned;
      }
    })
    .catch(() => {});

  function update(data: Array<ProjectArticlesData> | null) {
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
  pinnedProjects: Array<ArticleProject>,
  unpinnedProjects: Array<ArticleProject>,
  hasNoFavorites: boolean,
): ((
  dispatch: (arg0: any) => any,
  getState: () => AppState,
  getApi: ApiGetter,
) => Promise<void>) => async (
  dispatch: (arg0: any) => any,
  getState: () => AppState,
  getApi: ApiGetter,
) => {
  const api: Api = getApi();
  logEvent({
    message: 'Manage favorite projects',
    analyticsId: ANALYTICS_ARTICLES_PAGE,
  });
  dispatch(setError(null));
  dispatch(setLoading(true));
  const [error] = await until(
    pinnedProjects
      .map((it: ArticleProject) => api.projects.addFavorite(it.id))
      .concat(
        unpinnedProjects.map((it: ArticleProject) =>
          api.projects.removeFavorite(it.id),
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

const setNoFavoriteProjects = (): ((
  dispatch: (arg0: any) => any,
) => Promise<void>) => async (dispatch: (arg0: any) => any) => {
  dispatch(setLoading(false));
  dispatch(
    setError({
      noFavoriteProjects: true,
    }),
  );
};

const showContextActions = (
  actionSheet: ActionSheet,
  canCreateArticle: boolean,
  onShowMoreProjects: (...args: Array<any>) => any,
  onCreateArticle: () => any,
): (() => Promise<void>) => async () => {
  const actions: Array<ActionSheetOption> = [
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
    getStorageState().projects.some((it: ArticleProject) => it.pinned)
  ) {
    actions.unshift({
      title: i18n('New Article'),
      execute: onCreateArticle,
    });
  }

  const selectedAction:
    | ActionSheetOption
    | null
    | undefined = await showActions(actions, actionSheet);

  if (selectedAction && selectedAction.execute) {
    selectedAction.execute();
  }
};

const toggleAllProjects = (
  collapse: boolean = true,
): ((
  dispatch: (arg0: any) => any,
  getState: () => AppState,
) => Promise<void>) => async (
  dispatch: (arg0: any) => any,
  getState: () => AppState,
) => {
  const {articles, articlesList} = getState().articles;
  logEvent({
    message: `${collapse ? 'Collapse' : 'Expand'} all Knowledge base projects`,
    analyticsId: ANALYTICS_ARTICLES_PAGE,
  });
  const updatedProjectData: ArticlesList = (articles || []).reduce(
    (list: Array<ProjectArticlesData>, item: ProjectArticlesData) =>
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
  articles: Array<ProjectArticlesData> | null | undefined,
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
  return async (dispatch: (arg0: any) => any) => {
    dispatch(setList(articlesList));
    setArticlesListCache(articlesList);
  };
}

function storeProjectData(
  projectArticlesData: Array<ProjectArticlesData> | null,
) {
  return async (dispatch: (arg0: any) => any) => {
    dispatch(setArticles(projectArticlesData));
    await setArticlesCache(projectArticlesData);
  };
}

function getProjectDataPromises(
  api: Api,
  projects: Array<ArticleProject>,
): Array<Promise<ProjectArticlesData>> {
  return projects.map(async (project: ArticleProject) => {
    if (project.articles.collapsed === true) {
      return {
        ...{
          project,
        },
        articles: [],
      };
    }

    const [error, articles]: [
      CustomError | null | undefined,
      ProjectArticlesData,
    ] = await until(api.articles.getArticles(getArticlesQuery(), project.id));
    return {
      ...{
        project,
      },
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