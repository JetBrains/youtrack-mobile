import type {Attachment, IssueComment, IssueProject} from './CustomFields';
import type {AnyIssue} from './Issue';
import type {User} from './User';
import type {Visibility} from './Visibility';
export type Article = {
  $type: string;
  attachments: Attachment[];
  childArticles: Article[];
  comments?: IssueComment[];
  content: string;
  created: number;
  hasStar: boolean;
  hasUnpublishedChanges: boolean;
  id: string;
  idReadable: string;
  mentionedArticles: Article[];
  mentionedIssues: AnyIssue[];
  mentionedUsers: User[];
  ordinal: number;
  parentId: string | null;
  parentArticle: Article;
  project: ArticleProject | null;
  reporter: User;
  summary: string;
  updated: number;
  updatedBy: User;
  visibility: Visibility;
};
export type ArticleDraft = Partial<Article>;
export type ArticleNode = {
  children: ArticleNode[];
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
  articles: Article[];
};
