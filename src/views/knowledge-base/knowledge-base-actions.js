/* @flow */

import type ActionSheet from '@expo/react-native-action-sheet';

import animation from '../../components/animation/animation';
import Router from '../../components/router/router';
import {ANALYTICS_ARTICLES_PAGE} from '../../components/analytics/analytics-ids';
import {arrayToTree} from 'performant-array-to-tree';
import {
  createArticlesListItem,
  createArticleList,
  filterArticles,
  toggleArticleProjectListItem
} from '../../components/articles/articles-tree-helper';
import {flushStoragePart, getStorageState} from '../../components/storage/storage';
import {hasType} from '../../components/api/api__resource-types';
import {logEvent} from '../../components/log/log-helper';
import {notify} from '../../components/notification/notification';
import {setError, setList, setLoading} from './knowledge-base-reducers';
import {showActions} from '../../components/action-sheet/action-sheet';
import {sortByUpdatedReverse} from '../../components/search/sorting';
import {until} from '../../util/util';

import type Api from '../../components/api/api';
import type {AppState} from '../../reducers';
import type {
  Article,
  ArticleNodeList,
  ArticleProject,
  ArticlesList,
  ArticlesListItem,
  ArticlesListItemTitle
} from '../../flow/Article';
import type {IssueProject} from '../../flow/CustomFields';

type ApiGetter = () => Api;

const DRAFTS_TITLE: ArticlesListItemTitle = {name: 'Drafts', isDrafts: true, articles: {collapsed: true}};

const setArticlesListCache = (articlesList: ArticlesList) => {
  flushStoragePart({articlesList});
};

const getArticlesListCache = (): ArticlesList => getStorageState().articlesList || [];

const loadArticlesListFromCache = () => {
  return async (dispatch: (any) => any) => {
    const cachedArticlesList: ArticlesList = getArticlesListCache();
    if (cachedArticlesList?.length > 0) {
      dispatch(setList(cachedArticlesList));
      logEvent({message: 'Set articles list from cache'});
    }
  };
};

const createArticleListDrafts = (
  project: ArticleProject,
  data: ArticleNodeList = [],
  isCollapsed?: boolean
): ArticlesListItem => {
  return createArticlesListItem(
    project,
    arrayToTree(data),
    typeof isCollapsed === 'boolean' ? isCollapsed : !!project?.articles?.collapsed
  );
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
      const cachedDraftSection: ?ArticlesListItem = getArticlesListCache().find(
        (it: ArticlesListItem) => it.title.isDrafts);
      if (cachedDraftSection) {
        articlesList.unshift(cachedDraftSection);
      }
      dispatch(updateArticlesList(articlesList));
    }
  };
};

const filterArticlesList = (query: string) => {
  return async (dispatch: (any) => any) => {
    if (query) {
      const filteredArticlesAndDrafts: Array<Article> = filterArticles(getArticlesListCache(), query);
      const articles: Array<Article> = [];
      const drafts: Array<Article> = [];

      filteredArticlesAndDrafts.forEach((it: Article) => {
        if (hasType.articleDraft(it)) {
          drafts.push(it);
        } else {
          articles.push(it);
        }
      });

      const filteredArticlesList: ArticlesList = createList(articles, null, true);
      if (drafts.length > 0) {
        const draftsSection = createArticleListDrafts(DRAFTS_TITLE, drafts, false);
        filteredArticlesList.unshift(draftsSection);
      }

      dispatch(setList(filteredArticlesList));
    } else {
      dispatch(setList(getArticlesListCache()));
    }
  };
};

const loadArticlesDrafts = () => {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: ApiGetter) => {
    const state: AppState = getState();
    const articlesList: Array<Article> = state.articles.articlesList || [];

    const api: Api = getApi();

    const [error, articlesDrafts] = await until(api.articles.getArticleDrafts());

    if (error) {
      logEvent({message: 'Failed to load articles drafts', isError: true});
    } else {
      let updatedArticlesList: ArticlesList = articlesList.slice(0);

      if (articlesDrafts.length === 0) {
        updatedArticlesList = updatedArticlesList.reduce((list: Array<ArticlesListItem>, item: ArticlesListItem) => {
          if (!item.title.isDrafts) {
            return list.concat(item);
          }
        }, []);
      } else {
        let draftsSection: ?ArticlesListItem = articlesList.find((it: ArticlesListItem) => it.title.isDrafts);
        if (!draftsSection) {
          draftsSection = createArticleListDrafts(DRAFTS_TITLE);
          updatedArticlesList.unshift(draftsSection);
        }
        updatedArticlesList[0] = createArticleListDrafts(
          updatedArticlesList[0].title,
          articlesDrafts.sort(sortByUpdatedReverse)
        );
      }

      dispatch(updateArticlesList(updatedArticlesList));
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

      dispatch(updateArticlesList(updatedArticlesList));
    }
  };
};

const toggleProjectArticlesFavorite = (project: ArticleProject) => {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: ApiGetter) => {
    logEvent({message: 'Toggle project articles favorite', analyticsId: ANALYTICS_ARTICLES_PAGE});
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
      dispatch(loadArticlesList(false));
    }
  };
};

const toggleNonFavoriteProjectsVisibility = () => {
  return async (dispatch: (any) => any) => {
    const isPinnedOnly: boolean = getStorageState().articlesListPinnedOnly;
    await flushStoragePart({articlesListPinnedOnly: !isPinnedOnly});
    dispatch(loadArticlesList(true));
    notify(`${!isPinnedOnly ? 'Non-favorite projects are hidden' : 'Non-favorite projects are shown'}`);
  };
};

const showKBActions = (actionSheet: ActionSheet, canCreateArticle: boolean) => {
  return async (dispatch: (any) => any, getState: () => AppState) => {
    const state: AppState = getState();
    const {articlesList} = state.articles;
    const toggle = (collapse: boolean) => {
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

    const actions = [
      {
        title: 'Collapse all projects',
        execute: () => toggle(true)
      },
      {
        title: 'Expand all projects',
        execute: () => toggle(false)
      },
      {
        title: 'Hide/show non-favorite projects',
        execute: () => dispatch(toggleNonFavoriteProjectsVisibility())
      },
      {title: 'Cancel'}
    ];

    if (canCreateArticle) {
      actions.unshift({
        title: 'Create article',
        execute: () => Router.ArticleCreate()
      });
    }

    const selectedAction = await showActions(actions, actionSheet);

    if (selectedAction && selectedAction.execute) {
      selectedAction.execute();
    }
  };
};


export type KnowledgeBaseActions = {
  filterArticlesList: typeof filterArticlesList,
  loadArticlesDrafts: typeof loadArticlesDrafts,
  loadArticlesList: typeof loadArticlesList,
  loadArticlesListFromCache: typeof loadArticlesListFromCache,
  showKBActions: typeof showKBActions,
  toggleNonFavoriteProjectsVisibility: typeof toggleNonFavoriteProjectsVisibility,
  toggleProjectArticlesFavorite: typeof toggleProjectArticlesFavorite,
  toggleProjectArticlesVisibility: typeof toggleProjectArticlesVisibility,
};

export {
  filterArticlesList,
  loadArticlesDrafts,
  loadArticlesList,
  loadArticlesListFromCache,
  showKBActions,
  toggleNonFavoriteProjectsVisibility,
  toggleProjectArticlesFavorite,
  toggleProjectArticlesVisibility,
};
