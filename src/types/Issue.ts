import IssuePermissions from 'components/issue-permissions/issue-permissions';
import type {
  IssueProject,
  CustomFieldShort,
  CustomField,
  Tag,
  Attachment,
  IssueComment,
  IssueLink,
  CustomFieldText,
} from './CustomFields';
import type {User} from './User';
import type {UserGroup} from './UserGroup';
import type {Visibility} from './Visibility';
export type IssueContextData = {
  issue: IssueFull;
  issuePermissions: IssuePermissions;
  dispatcher: () => any;
};
export type IssueOnList = Partial<Omit<IssueFull, 'fields'>> & {
  fieldHash: {
    key: string;
    value: Record<string, any>;
  };
  fields: CustomFieldShort[];
};
export type IssueFull = {
  $type?: string;
  attachments: Attachment[];
  comments?: IssueComment[];
  created: number;
  description: string;
  fieldHash?: any;
  fields: Array<CustomField | CustomFieldText>;
  _fields?: Array<CustomField | CustomFieldText>;
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
};
export type AnyIssue = IssueOnList | IssueFull | IssueLink;
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
export type SavedQuery = {
  id: string;
  name: string;
  query: string;
  isUpdatable: boolean;
  pinned?: boolean;
  owner: {
    id: string;
    ringId: string;
  };
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