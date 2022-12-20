import {arrayToTree} from 'performant-array-to-tree';
import {hasType} from '../api/api__resource-types';
import {sortByOrdinal} from '../search/sorting';
import type {
  Article,
  ArticleNode,
  ArticleNodeList,
  ArticleProject,
  ArticlesList,
  ArticlesListItem,
  ProjectArticlesData,
} from 'types/Article';
import type {IssueProject} from 'types/CustomFields';
import type {Visibility} from 'types/Visibility';
export const createArticlesListItem = (
  project: ArticleProject | null,
  data: ArticleNodeList,
  isCollapsed: boolean,
): ArticlesListItem => {
  return {
    title: project
      ? {...project, articles: {...project.articles, collapsed: isCollapsed}}
      : null,
    data: isCollapsed ? [] : data,
    dataCollapsed: isCollapsed && data.length > 0 ? data : null,
  };
};
export const createArticleList = (
  projectData: ProjectArticlesData[],
  isExpanded?: boolean,
): ArticlesList => {
  return projectData.reduce((list: ArticlesList, item: ProjectArticlesData) => {
    const articles: Article[] = item.articles
      .map((it: Article) => {
        const parentId: string | null =
          isExpanded === true ? null : it?.parentArticle?.id || null;
        return {...it, parentId};
      })
      .sort(sortByOrdinal);
    articles.forEach((article: Article) => {
      if (
        hasType.visibilityLimited(article.visibility) ||
        !article.parentArticle
      ) {
        return;
      }

      let parent = article.parentArticle;

      while (parent) {
        if (hasType.visibilityLimited(parent.visibility)) {
          article.visibility = ({
            ...(article.visibility || {}),
            inherited: parent.visibility,
          } as any) as Visibility;
          return;
        }

        parent = parent.parentArticle;
      }
    });
    return list.concat(
      createArticlesListItem(
        item.project,
        arrayToTree(articles),
        isExpanded === true ? false : !!item?.project?.articles?.collapsed,
      ),
    );
  }, []);
};
export const toggleProject = (
  item: ArticlesListItem,
  isCollapsed: boolean,
): ArticlesListItem => {
  const project: ArticleProject | null = item.title;
  return createArticlesListItem(
    project,
    item.dataCollapsed || item.data,
    isCollapsed,
  );
};
export const flattenArticleListChildren = (
  nodes: ArticleNodeList,
): Article[] => {
  let list: Article[] = [];

  for (let i = 0; i < (nodes || []).length; i++) {
    const node = nodes[i];
    list.push(node.data);
    list = [...list, ...flattenArticleListChildren(node.children)];
  }

  return list;
};
export const findNodeById = (
  articlesList: ArticleNodeList,
  id: string,
): ArticleNode | null => {
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
  articlesList: ArticlesList,
  projectId: string,
): ArticlesListItem | null | undefined => {
  return (articlesList || []).find(
    (it: ArticlesListItem) => it?.title?.id === projectId,
  );
};

const getProjectNodeData = (projectNode: ArticlesListItem): ArticleNodeList => {
  return projectNode?.dataCollapsed?.length
    ? projectNode.dataCollapsed
    : projectNode.data;
};

export const findArticleNode = (
  articlesList: ArticlesList,
  projectId: string,
  nodeId: string,
): ArticleNode | null => {
  const articleProject:
    | ArticlesListItem
    | null
    | undefined = findArticleProjectListItem(articlesList, projectId);
  return articleProject
    ? findNodeById(getProjectNodeData(articleProject), nodeId)
    : null;
};
export const createBreadCrumbs = (
  article: Article,
  articlesList: ArticlesList,
  excludeProject: boolean = false,
): Array<Article | IssueProject> => {
  if (!article?.project?.id) {
    return [];
  }

  const breadCrumbs: Array<Article | IssueProject> = [];
  const projectNode:
    | ArticlesListItem
    | null
    | undefined = findArticleProjectListItem(articlesList, article.project.id);

  if (!projectNode || (!projectNode?.data && !projectNode?.dataCollapsed)) {
    return [];
  }

  let parentId: string | null = article?.parentArticle?.id;
  const projectArticles: Article[] = flattenArticleListChildren(
    getProjectNodeData(projectNode),
  );

  while (parentId) {
    const parentArticle: Article | null | undefined = projectArticles.find(
      (it: Article) => it.id === parentId,
    );

    if (parentArticle) {
      breadCrumbs.push(parentArticle);
      parentId = parentArticle.parentArticle?.id;
    }
  }

  breadCrumbs.reverse();

  if (!excludeProject) {
    breadCrumbs.unshift(article.project);
  }

  return breadCrumbs;
};
