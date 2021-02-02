/* @flow */

import {arrayToTree} from 'performant-array-to-tree';
import {getStorageState} from '../storage/storage';
import {groupByFavoritesAlphabetically, sortByOrdinal} from '../search/sorting';

import type {
  Article,
  ArticleNode,
  ArticleNodeList,
  ArticleProject,
  ArticlesList,
  ArticlesListItem
} from '../../flow/Article';
import type {Folder} from '../../flow/User';
import type {IssueProject} from '../../flow/CustomFields';
import {hasType} from '../api/api__resource-types';


export const createArticlesListItem = (
  project: ArticleProject,
  data: ArticleNodeList,
  isCollapsed: boolean
): ArticlesListItem => {
  return {
    title: project ? {
      ...project,
      articles: {...project.articles, collapsed: isCollapsed}
    } : null,
    data: isCollapsed ? [] : data,
    dataCollapsed: isCollapsed ? data : null
  };
};

export const getGroupedProjects = (): Array<Folder> => {
  const projects: Array<Folder> = getStorageState().projects;
  return groupByFavoritesAlphabetically(projects, 'pinned');
};

export const createArticleList = (
  articles: Array<Article>,
  cachedArticlesList: ArticlesList | null,
  flat: boolean = false,
  isCollapsed?: boolean
): ArticlesList => {
  return getGroupedProjects().reduce((list: ArticlesList, project: ArticleProject) => {
    const projectArticles: Array<Article> = (
      articles
        .filter((it: Article) => it?.project?.id === project.id)
        .sort(sortByOrdinal)
        .map((it: Article) => {
          const parentId = flat ? null : it?.parentArticle?.id;
          return {...it, ...{parentId}};
        })
    );

    projectArticles.forEach((article: Article) => {
      if (hasType.visibilityLimited(article.visibility) || !article.parentArticle) {
        return;
      }
      let parent = article.parentArticle;
      while (parent) {
        if (hasType.visibilityLimited(parent.visibility)) {
          article.visibility.inherited = parent.visibility;
          return;
        }
        parent = parent.parentArticle;
      }
    });

    const hasCollapsed: boolean = typeof isCollapsed === 'boolean';
    let isProjectCollapsed: boolean = hasCollapsed ? !!isCollapsed : true;
    if (projectArticles?.length > 0) {
      const cachedArticlesListProjectListItem: ?ArticlesListItem = findArticleProjectListItem(
        cachedArticlesList || [],
        projectArticles[0].project.id
      );
      if (cachedArticlesListProjectListItem) {
        const cachedProjectCollapsed: ?boolean = cachedArticlesListProjectListItem?.title?.articles?.collapsed;
        isProjectCollapsed = (
          !hasCollapsed && typeof cachedProjectCollapsed === 'boolean'
            ? cachedProjectCollapsed
            : isProjectCollapsed
        );
      }
    }

    project.articles = project.articles || {collapsed: isProjectCollapsed};

    return list.concat(
      createArticlesListItem(project, arrayToTree(projectArticles), isProjectCollapsed)
    );
  }, []).filter(it => it.data?.length > 0 || it.dataCollapsed?.length > 0);
};

export const doFilterArticles = (articles: Array<Article>, query: string = ''): Array<Article> => {
  return articles.filter((it: Article) => (it?.summary || '').toLowerCase().includes(query.toLowerCase()));
};

export const toggleArticleProjectListItem = (item: ArticlesListItem, isCollapsed?: boolean): ArticlesListItem => {
  const project: ArticleProject = item.title;
  const collapsed: boolean = typeof isCollapsed === 'boolean' ? isCollapsed : !project.articles.collapsed;
  return createArticlesListItem(project, item.dataCollapsed || item.data, collapsed);
};

export const flattenArticleListChildren = (nodes: ArticleNodeList): Array<Article> => {
  let list: Array<Article> = [];
  for (let i = 0; i < (nodes || []).length; i++) {
    const node = nodes[i];
    list.push(node.data);
    list = [...list, ...flattenArticleListChildren(node.children)];
  }
  return list;
};

export const flattenArticleList = (articleList: ArticlesList = []): ArticlesList => {
  return articleList.reduce((list: ArticlesList, item: ArticlesListItem) => {
    return list.concat(
      flattenArticleListChildren(
        item.title.articles.collapsed
          ? item.dataCollapsed
          : item.data
      )
    );
  }, []);
};

export const findNodeById = (articlesList: ArticleNodeList, id: string): ArticleNode => {
  for (let i = 0, l = (articlesList || []).length; i < l; i++) {
    if (articlesList[i].data.id === id) {
      return articlesList[i];
    } else if (articlesList[i].children) {
      const node = findNodeById(articlesList[i].children, id);
      if (node) {
        return node;
      }
    }
  }
  return null;
};

export const findArticleProjectListItem = (
  articlesList: ArticleNodeList,
  projectId: string
): ArticlesListItem | null => {
  return (articlesList || []).find((it: ArticlesListItem) => it.title.id === projectId);
};

const getProjectNodeData = (projectNode): ArticleNodeList => (
  projectNode.dataCollapsed?.length > 0
    ? projectNode.dataCollapsed
    : projectNode.data
);

export const findArticleNode = (
  articlesList: Array<ArticleNode>,
  projectId: string,
  nodeId: string
): ArticleNode | null => {
  const articleProject: ArticlesListItem = findArticleProjectListItem(articlesList, projectId);
  return articleProject ? findNodeById(getProjectNodeData(articleProject), nodeId) : null;
};

export const createBreadCrumbs = (
  article: Article,
  articlesList: ArticlesList,
  excludeProject: boolean = false
): Array<Article | IssueProject> => {
  if (!article?.project?.id) {
    return [];
  }

  const breadCrumbs: Array<Article | IssueProject> = [];

  const projectNode: ArticlesListItem = findArticleProjectListItem(articlesList, article.project.id);
  if (!projectNode || (!projectNode?.data && !projectNode?.dataCollapsed)) {
    return [];
  }

  let parentId: string | null = article?.parentArticle?.id;
  const projectArticles: Array<Article> = flattenArticleListChildren(
    getProjectNodeData(projectNode)
  );

  while (parentId) {
    const parentArticle: ?Article = projectArticles.find((it: Article) => it.id === parentId);
    if (parentArticle) {
      breadCrumbs.push(parentArticle);
      parentId = parentArticle.parentArticle?.id;
    }
  }

  if (breadCrumbs.length === 0) {
    return [];
  }

  breadCrumbs.reverse();
  if (!excludeProject) {
    breadCrumbs.unshift(article.project);
  }
  return breadCrumbs;
};
