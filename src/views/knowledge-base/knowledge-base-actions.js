/* @flow */

import type ActionSheet from '@expo/react-native-action-sheet';

import animation from '../../components/animation/animation';
import Router from '../../components/router/router';
import {ANALYTICS_ARTICLES_PAGE} from '../../components/analytics/analytics-ids';
import {
  createArticleList,
  filterArticles,
  flattenArticleList,
  toggleArticleProjectListItem
} from '../../components/articles/articles-tree-helper';
import {flushStoragePart, getStorageState} from '../../components/storage/storage';
import {logEvent} from '../../components/log/log-helper';
import {notify} from '../../components/notification/notification';
import {setError, setList, setLoading} from './knowledge-base-reducers';
import {showActions} from '../../components/action-sheet/action-sheet';
import {sortByUpdatedReverse} from '../../components/search/sorting';
import {until} from '../../util/util';

import type Api from '../../components/api/api';
import type {ActionSheetOption} from '../../components/action-sheet/action-sheet';
import type {AppState} from '../../reducers';
import type {Article, ArticleProject, ArticlesList, ArticlesListItem} from '../../flow/Article';
import type {IssueProject} from '../../flow/CustomFields';

type ApiGetter = () => Api;


const setArticlesListCache = (articlesList: ArticlesList) => {
  flushStoragePart({articlesList});
};

const getArticlesListCache = (): ArticlesList => getStorageState().articlesList || [];

const loadArticlesListFromCache = () => {
  return async (dispatch: (any) => any) => {
    const cachedArticlesList: ArticlesList = getArticlesListCache();
    if (cachedArticlesList?.length > 0) {
      dispatch(setList(cachedArticlesList));
      logEvent({message: 'Set article list from cache'});
    }
  };
};

const createList = (
  articles: Array<Article>,
  cachedArticlesList: ArticlesList | null,
  flat?: boolean
): ArticlesList => {
  return createArticleList(articles, cachedArticlesList, flat);
};

const updateArticlesList = (articlesList: ArticlesList) => {
  return async (dispatch: (any) => any) => {
    dispatch(setList(articlesList));
    setArticlesListCache(articlesList);
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
      const articlesList: ArticlesList = createList(articles, getArticlesListCache());
      dispatch(updateArticlesList(articlesList));
    }
  };
};

const filterArticlesList = (query: string) => {
  return async (dispatch: (any) => any) => {
    if (query) {
      const filteredArticles: Array<Article> = filterArticles(getArticlesListCache(), query);
      const filteredArticlesList: ArticlesList = createList(filteredArticles, null, true);
      dispatch(setList(filteredArticlesList));
    } else {
      dispatch(setList(getArticlesListCache()));
    }
  };
};

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
          i = toggleArticleProjectListItem(section);
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
      const articles: Array<Article> = flattenArticleList(articlesList);
      dispatch(updateArticlesList(createList(articles, getArticlesListCache())));
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
        return list.concat(toggleArticleProjectListItem(item, collapse));
      }, []);

      dispatch(setList(updatedArticlesList));
      setArticlesListCache(updatedArticlesList);
      notify(`${collapse ? 'Projects collapsed' : 'Projects expanded'}`);
    }

  };
};

export type KnowledgeBaseActions = {
  filterArticlesList: typeof filterArticlesList,
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
  filterArticlesList,
  loadArticlesDrafts,
  loadArticlesList,
  loadArticlesListFromCache,
  showContextActions,
  toggleAllProjects,
  toggleNonFavoriteProjectsVisibility,
  toggleProjectArticlesFavorite,
  toggleProjectArticlesVisibility,
};
