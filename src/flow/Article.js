import type {Attachment, IssueProject} from './CustomFields';
import type {IssueOnList} from './Issue';
import type {User} from './User';
import IssueVisibility from '../components/visibility/issue-visibility';

export type Article = {
  $type: string,
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

export type ArticleDraft = Article & {$isUnpublishedDraft?: boolean}

export type ArticleNode = {
  children: Array<Article>,
  data: Article & { parentId: string | null }
}

export type ArticleNodeList = Array<ArticleNode>;

export type ArticlesListItemTitle = ArticleProject & { isDrafts: boolean };

export type ArticlesListItem = {
  title: ArticlesListItemTitle,
  data: ArticleNodeList,
  dataCollapsed: ArticleNodeList | null
};

export type ArticlesList = Array<ArticlesListItem>;

export type ArticleProject = $Shape<IssueProject> & {
  articles: {
    collapsed: boolean
  }
};
