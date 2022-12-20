import {sortAlphabetically} from 'components/search/sorting';
import type {
  Article,
  ArticleProject,
  ArticlesList,
  ArticlesListItem,
  ProjectArticlesData,
} from 'flow/Article';
import type {Folder} from 'flow/User';
export const createSortedProjects = (
  projects: Array<Folder>,
  cachedArticleList: ArticlesList,
  expandAll?: boolean,
): Array<ArticleProject> => {
  const cachedExpandedProjects: {
    key: string;
    value: ArticleProject;
  } =
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
  articles: Array<ProjectArticlesData>,
  projectData: ProjectArticlesData,
): Array<ProjectArticlesData> => {
  const index: number = articles.findIndex(
    (it: ProjectArticlesData) => it.project.id === projectData.project.id,
  );
  const updatedArticles = articles.slice();
  updatedArticles.splice(index, 1, projectData);
  return updatedArticles;
};
export const removeProjectData = (
  articles: Array<ProjectArticlesData>,
  project: ArticleProject,
): Array<ProjectArticlesData> => {
  const index: number = articles.findIndex(
    (it: ProjectArticlesData) => it.project.id === project.id,
  );
  const updatedArticles = articles.slice();
  updatedArticles.splice(index, 1);
  return updatedArticles;
};
export const createProjectDataFromArticles = (
  articles: Array<ProjectArticlesData>,
): Array<ProjectArticlesData> => {
  const projectDataObj: Record<string, any> = (articles || []).reduce(
    (data: Record<string, any>, article: Article) => {
      if (!data[article.project.id]) {
        data[article.project.id] = {
          project: article.project,
          articles: [],
        };
      }

      data[article.project.id].articles.push(article);
      return data;
    },
    {},
  );
  return Object.keys(projectDataObj).reduce(
    (list: Array<ProjectArticlesData>, key: string) =>
      list.concat(projectDataObj[key]),
    [],
  );
};