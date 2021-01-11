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


export const createArticlesListItem = (
  project: ArticleProject,
  data: ArticleNodeList,
  isCollapsed: boolean
): ArticlesListItem => {
  return {
    title: {
      ...project,
      articles: {...project.articles, collapsed: isCollapsed}
    },
    data: isCollapsed ? [] : data,
    dataCollapsed: isCollapsed ? data : null
  };
};

export const getGroupedProjects = (): Array<Folder> => {
  const projects: Array<Folder> = getStorageState().projects;
  return groupByFavoritesAlphabetically(projects, 'pinned');
};

export const createTree = (articles: Array<Article>, cachedArticlesList: ArticlesList | null): ArticlesList => {
  return getGroupedProjects().reduce((list: ArticlesList, project: ArticleProject) => {
    const projectArticles: Array<Article> = (
      articles
        .filter((it: Article) => it.project.id === project.id)
        .sort(sortByOrdinal)
        .map((it: Article) => ({...it, parentId: it?.parentArticle?.id}))
    );

    let isProjectCollapsed: boolean = false;
    if (projectArticles?.length > 0) {
      const cachedArticlesListProjectListItem = findArticleProjectListItem(
        cachedArticlesList,
        projectArticles[0].project.id
      );
      isProjectCollapsed = !!cachedArticlesListProjectListItem?.title?.articles?.collapsed;
    }

    const data: ArticleNodeList = arrayToTree(projectArticles);
    project.articles = project.articles || {collapsed: isProjectCollapsed};

    return list.concat(createArticlesListItem(project, data, isProjectCollapsed));
  }, []);
};

export const toggleArticleProjectListItem = (item: ArticlesListItem, isCollapsed?: boolean): ArticlesListItem => {
  const project: ArticleProject = item.title;
  const collapsed: boolean = typeof isCollapsed === 'boolean' ? isCollapsed : !project.articles.collapsed;
  return createArticlesListItem(project, item.dataCollapsed || item.data, collapsed);
};

export const flattenTree = (nodes: ArticleNodeList = []): Array<Article> => {
  let resultArray: Array<Article> = [];
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    resultArray.push(node.data);
    resultArray = [...resultArray, ...flattenTree(node.children)];
  }
  return resultArray;
};

export const findNodeById = (articlesList: ArticleNodeList, id: string): ArticleNode => {
  for (let i = 0, l = articlesList.length; i < l; i++) {
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

export const findArticleProjectListItem = (articlesList: ArticleNodeList, projectId: string): ArticleNode | null => {
  return articlesList.find((it: ArticlesListItem) => it.title.id === projectId);
};

export const findArticleNode = (
  articlesList: Array<ArticleNode>,
  projectId: string,
  nodeId: string
): ArticleNode | null => {
  const articleProject: ArticlesListItem = findArticleProjectListItem(articlesList, projectId);
  return articleProject ? findNodeById(articleProject.data, nodeId) : null;
};

export const createBreadCrumbs = (article: Article, articlesList: ArticlesList): Array<Article | IssueProject> => {
  if (!article?.project?.id) {
    return [];
  }

  const breadCrumbs: Array<Article | IssueProject> = [];
  const projectNode: ArticleNode = findArticleProjectListItem(articlesList, article.project.id);
  const projectArticles: Array<Article> = flattenTree(projectNode.data);

  let parentId: string | null = article?.parentArticle?.id;
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

  breadCrumbs.reverse().unshift(article.project);
  return breadCrumbs;
};
