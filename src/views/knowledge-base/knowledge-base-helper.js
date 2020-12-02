/* @flow */

import {getStorageState} from '../../components/storage/storage';
import {groupByFavoritesAlphabetically, sortByOrdinal} from '../../components/search/sorting';

import type {Folder} from '../../flow/User';
import type {Article, ArticlesListItem, ArticleNode, ArticlesList} from '../../flow/Article';
import {arrayToTree} from 'performant-array-to-tree';


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
    resultArray.push(node);
    resultArray = [...resultArray, ...flattenTree(node.children)];
  }
  return resultArray;
};

export const findNodeById = (articleList: Array<ArticleNode>, id: string): ArticleNode => {
  for (let i = 0, l = articleList.length; i < l; i++) {
    if (articleList[i].data.id === id) {
      return articleList[i];
    } else if (articleList[i].children) {
      const node = findNodeById(articleList[i].children, id);
      if (node) {
        return node;
      }
    }
  }
  return null;
};
