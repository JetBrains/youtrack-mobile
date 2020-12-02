import type {Attachment, IssueProject} from './CustomFields';
import type {IssueOnList} from './Issue';
import type {User} from './User';
import IssueVisibility from '../components/visibility/issue-visibility';

export type Article = {
  attachments: Array<Attachment>,
  content: string,
  created: number,
  hasStar: boolean,
  hasUnpublishedChanges: boolean,
  id: string,
  idReadable: string,
  mentionedArticles: Article,
  mentionedIssues: IssueOnList,
  mentionedUsers: User,
  ordinal: number,
  parentArticle: Article,
  project: IssueProject,
  reporter: User,
  summary: string,
  updated: number,
  updatedBy: User,
  visibility: IssueVisibility
}

export type ArticleNode = {
  children: Array<Article>,
  data: Article & { parentId: string | null }
}

export type ArticlesListItem = {
  title: IssueProject,
  data: Array<ArticleNode>
};

export type ArticlesList = Array<ArticlesListItem>;
