import IssuePermissions from 'components/issue-permissions/issue-permissions';
import type {
  Tag,
  Attachment,
  IssueComment,
  IssueLink,
  CustomFieldBase,
} from './CustomFields';
import type {UserGroup} from './UserGroup';
import type {User} from './User';
import type {Visibility} from './Visibility';
import {AnyCustomField} from 'components/custom-field/custom-field-helper';
import {Article} from 'types/Article';
import {ActivityItem} from 'types/Activity';
import {Project} from 'types/Project';

export type IssueContextData = {
  dispatcher: () => any;
  isConnected: boolean;
  issue: IssueFull;
  issuePermissions: IssuePermissions;
};

export interface BaseIssue {
  $type: string;
  created: number;
  fields: CustomFieldBase[];
  id: string;
  idReadable: string;
  links: IssueLink[];
  project: Project;
  reporter: User;
  resolved: boolean;
  summary: string;
  tags: Tag[];
  updated: number;
}

export interface IssueOnList extends BaseIssue {
  fieldHash: {
    key: string;
    value: Record<string, any>;
  };
  trimmedDescription: string;
  activityPage?: ActivityItem[],
  description?: string;
}

export interface IssueFull  extends BaseIssue {
  attachments: Attachment[];
  comments?: IssueComment[];
  description: string;
  fieldHash?: any;
  _fields?: AnyCustomField[];
  updater: User;
  voters: {
    hasVote: boolean;
  };
  votes: number;
  watchers: {
    hasStar: boolean;
  };
  wikifiedDescription: string;
  usesMarkdown: boolean;
  visibility: Visibility;
  hasEmail?: boolean;
  mentionedArticles: Article[];
  mentionedIssues: AnyIssue[];
  mentionedUsers: User[];
}

export type IssueCreate = Omit<
  IssueFull,
  | 'comments'
  | 'hasEmail'
  | 'idReadable'
  | 'project'
  | 'reporter'
  | 'resolved'
  | 'updated'
  | 'updater'
  | 'voters'
  | 'watchers'
  | 'wikifiedDescription'
> & { project: Partial<Project>; };
export type AnyIssue = IssueOnList | IssueFull | IssueLink | IssueCreate;
export type TransformedSuggestion = {
  prefix: string;
  option: string;
  suffix: string;
  description: string;
  matchingStart: number;
  matchingEnd: number;
  caret: number;
  completionStart: number;
  completionEnd: number;
};
export type ServersideSuggestion = {
  $type?: string;
  auxiliaryIcon?: string | null;
  caret: number;
  className?: string | null;
  completionEnd: number;
  completionStart: number;
  description: string;
  group?: UserGroup | null;
  icon?: string | null;
  matchingEnd: number;
  matchingStart: number;
  option: string;
  prefix: string | null;
  suffix: string | null;
};
export type ServersideSuggestionLegacy = {
  o: string;
  d: string;
  hd: string;
  pre: string;
  suf: string;
  ms: number;
  me: number;
  cp: number;
  cs: number;
  ce: number;
};
export type SuggestedCommand = {
  description: string;
  error: boolean;
  delete: boolean;
};
export type CommandSuggestion = {
  id: string;
  caret: number;
  comment: string;
  completionStart: number;
  completionEnd: number;
  matchingStart: number;
  matchingEnd: number;
  description: string;
  option: string;
  prefix: string | null | undefined;
  suffix: string;
};
export type CommandSuggestionResponse = {
  query: string;
  caret: number;
  commands: SuggestedCommand[];
  suggestions: CommandSuggestion[];
};

export type TabRoute = {
  key: string | number;
  title: string;
  id?: string;
};
export type OpenNestedViewParams = {
  issue?: IssueFull;
  issueId?: string;
};

export interface UsedQuery {
  id: string;
  name: string;
  query: string;
}

export interface AssistSuggest {
  title: string | null;
  data: Array<TransformedSuggestion | UsedQuery>;
}
