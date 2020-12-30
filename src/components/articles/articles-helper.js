/* @flow */

import {arrayToTree} from 'performant-array-to-tree';
import {getStorageState} from '../storage/storage';
import {groupByFavoritesAlphabetically, sortByOrdinal} from '../search/sorting';

import type {Article, ArticleNode, ArticlesList, ArticlesListItem} from '../../flow/Article';
import type {Folder} from '../../flow/User';
import type {IssueProject} from '../../flow/CustomFields';


export const getGroupedProjects = (): Array<Folder> => {
  const projects: Array<Folder> = getStorageState().projects;
  return groupByFavoritesAlphabetically(projects, 'pinned');
};

export const createTree = (articles: Array<Article>): ArticlesList => {
  return getGroupedProjects().reduce((list: Array<ArticlesListItem>, project) => {
    const projectArticles: Array<Article> = (
      articles
        .filter((it: Article) => it.project.id === project.id)
        .sort(sortByOrdinal)
        .map((it: Article) => ({...it, parentId: it?.parentArticle?.id}))
    );

    const data: Array<ArticleNode> = arrayToTree(projectArticles);
    return list.concat({
      title: project,
      data: data
    });
  }, []);
};

export const flattenTree = (nodes: Array<ArticleNode> = []): Array<Article> => {
  let resultArray: Array<Article> = [];
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    resultArray.push(node.data);
    resultArray = [...resultArray, ...flattenTree(node.children)];
  }
  return resultArray;
};

export const findNodeById = (articlesList: Array<ArticleNode>, id: string): ArticleNode => {
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

export const findArticleProjectNode = (articlesList: Array<ArticleNode>, projectId: string): ArticleNode | null => {
  return articlesList.find((it: ArticlesListItem) => it.title.id === projectId);
};

export const findArticleNode = (
  articlesList: Array<ArticleNode>,
  projectId: string,
  nodeId: string
): ArticleNode | null => {
  const articleProject: ArticlesListItem = findArticleProjectNode(articlesList, projectId);
  return articleProject ? findNodeById(articleProject.data, nodeId) : null;
};

export const createBreadCrumbs = (article: Article, articlesList: ArticlesList): Array<Article | IssueProject> => {
  if (!article?.project?.id) {
    return [];
  }

  const breadCrumbs: Array<Article | IssueProject> = [];
  const projectNode: ArticleNode = findArticleProjectNode(articlesList, article.project.id);
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
