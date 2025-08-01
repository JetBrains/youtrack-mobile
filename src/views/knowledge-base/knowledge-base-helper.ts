import {sortAlphabetically} from 'components/search/sorting';
import type {
  Article,
  ArticleProject,
  ArticlesList,
  ArticlesListItem,
  ProjectArticlesData,
} from 'types/Article';
import type {Folder} from 'types/User';
export const createSortedProjects = (
  projects: Folder[],
  cachedArticleList: ArticlesList,
  expandAll?: boolean,
): ArticleProject[] => {
  const cachedExpandedProjects =
    !expandAll && projects.length > 0 && cachedArticleList
      ? (cachedArticleList || [])
          .filter(
            (listItem: ArticlesListItem) => !listItem.title.articles.collapsed,
          )
          .reduce(
            (
              cachedProjects: {
                key: string;
                value: ArticleProject;
              },
              listItem: ArticlesListItem,
            ) => {
              cachedProjects[listItem.title.id] = listItem.title;
              return cachedProjects;
            },
            {},
          )
      : {};
  return projects.sort(sortAlphabetically).map((project: ArticleProject) => {
    project.articles =
      expandAll === true
        ? {
            collapsed: false,
          }
        : cachedExpandedProjects[project.id]
        ? cachedExpandedProjects[project.id].articles
        : {
            collapsed: true,
          };
    return project;
  });
};
export const replaceProjectData = (
  articles: ProjectArticlesData[],
  projectData: ProjectArticlesData,
): ProjectArticlesData[] => {
  const index: number = articles.findIndex(
    (it: ProjectArticlesData) => it.project.id === projectData.project.id,
  );
  const updatedArticles = articles.slice();
  updatedArticles.splice(index, 1, projectData);
  return updatedArticles;
};
export const removeProjectData = (
  articles: ProjectArticlesData[],
  project: ArticleProject,
): ProjectArticlesData[] => {
  const index: number = articles.findIndex(
    (it: ProjectArticlesData) => it.project.id === project.id,
  );
  const updatedArticles = articles.slice();
  updatedArticles.splice(index, 1);
  return updatedArticles;
};
export const createProjectDataFromArticles = (
  articles: Article[],
): ProjectArticlesData[] => {
  const projectDataObj: Record<string, ProjectArticlesData> = (articles || []).reduce(
    (data: Record<string, any>, article: Article) => {
      if (article.project) {
        if (!data[article.project.id]) {
          data[article.project.id] = {
            project: article.project,
            articles: [],
          };
        }

        data[article.project.id].articles.push(article);
      }
      return data;
    },
    {},
  );
  return Object.keys(projectDataObj).reduce(
    (list: ProjectArticlesData[], key: string) =>
      list.concat(projectDataObj[key]),
    [],
  );
};
