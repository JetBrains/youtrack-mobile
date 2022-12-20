import type {Attachment, IssueProject} from './CustomFields';
import type {IssueOnList} from './Issue';
import type {User} from './User';
import type {Visibility} from './Visibility';
export type Article = {
  $type: string;
  attachments: Array<Attachment>;
  childArticles: Array<Article>;
  content: string;
  created: number;
  hasStar: boolean;
  hasUnpublishedChanges: boolean;
  id: string;
  idReadable: string;
  mentionedArticles: Article;
  mentionedIssues: IssueOnList;
  mentionedUsers: User;
  ordinal: number;
  parentId: string | null;
  parentArticle: Article;
  project: ArticleProject;
  reporter: User;
  summary: string;
  updated: number;
  updatedBy: User;
  visibility: Visibility;
};
export type ArticleDraft = Partial<Article>;
export type ArticleNode = {
  children: Array<ArticleNode>;
  data: Article & {
    parentId: string | null;
  };
};
export type ArticleNodeList = Array<ArticleNode>;
export type ArticlesListItem = {
  title: ArticleProject | null;
  data: ArticleNodeList;
  dataCollapsed?: ArticleNodeList | null;
};
export type ArticlesList = Array<ArticlesListItem>;
export type ArticleProject = Partial<IssueProject> & {
  articles: {
    collapsed: boolean;
  };
};
export type ProjectArticlesData = {
  project: ArticleProject;
  articles: Array<Article>;
};
