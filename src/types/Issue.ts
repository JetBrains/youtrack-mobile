import IssuePermissions from 'components/issue-permissions/issue-permissions';
import type {
  IssueProject,
  CustomFieldShort,
  Tag,
  Attachment,
  IssueComment,
  IssueLink,
} from './CustomFields';
import type {UserGroup} from './UserGroup';
import type {User} from './User';
import type {Visibility} from './Visibility';
import {AnyCustomField} from 'components/custom-field/custom-field-helper';
import {Article} from 'types/Article';

export type IssueContextData = {
  dispatcher: () => any;
  isConnected: boolean;
  issue: IssueFull;
  issuePermissions: IssuePermissions;
};
export type IssueOnList = Partial<Omit<IssueFull, 'fields'>> & {
  fieldHash: {
    key: string;
    value: Record<string, any>;
  };
  fields: CustomFieldShort[];
  trimmedDescription: string;
};
export type IssueFull = {
  $type: string;
  attachments: Attachment[];
  comments?: IssueComment[];
  created: number;
  description: string;
  fieldHash?: any;
  fields: AnyCustomField[];
  _fields?: AnyCustomField[];
  id: string;
  idReadable: string;
  links: IssueLink[];
  project: IssueProject;
  reporter: User;
  resolved: boolean;
  summary: string;
  tags: Tag[];
  updated: number;
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
};
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
> & { project: Partial<IssueProject>; };
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
