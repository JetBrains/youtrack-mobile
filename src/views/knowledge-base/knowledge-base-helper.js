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

export const findProjectNode = (articlesList: Array<ArticleNode>, projectId: string, nodeId: string): ArticleNode | null => {
  const articleProject: ArticlesListItem = articlesList.find(
    (it: ArticlesListItem) => it.title.id === projectId
  );
  return articleProject ? findNodeById(articleProject.data, nodeId) : null;
};
