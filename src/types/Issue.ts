import IssuePermissions from 'components/issue-permissions/issue-permissions';

import type {AnyCustomField} from 'components/custom-field/custom-field-helper';
import type {Article} from 'types/Article';
import type {
  Attachment,
  ColorField,
  CustomFieldBase,
  ICustomFieldValue,
  IssueComment,
  IssueLink,
  Tag,
  TagBase,
} from './CustomFields';
import type {EntityBase} from 'types/Entity';
import type {Project, ProjectBase, ProjectHelpDeskSettingsBase} from 'types/Project';
import type {User, UserBase} from './User';
import type {UserGroup} from './UserGroup';
import type {Visibility} from './Visibility';

export type IssueContextData = {
  dispatcher: () => any;
  isConnected: boolean;
  issue: IssueFull;
  issuePermissions: IssuePermissions;
};

export interface BaseIssue extends EntityBase {
  created: number;
  fields: CustomFieldBase[];
  idReadable: string;
  links: IssueLink[];
  project: Project;
  reporter: User;
  resolved: boolean;
  summary: string;
  tags: Tag[];
  updated: number;
}

export interface IssueSprint extends EntityBase {
  name: string;
  agile: {
    id: string;
    name: string;
  };
}

interface TimeTrackingSettings {
  $type: string;
  enabled: boolean;
  timeSpent: {
    $type: string;
    field: ICustomFieldValue;
    id: string;
  };
}

export interface ListIssueFieldValue extends ICustomFieldValue {
  color: ColorField;
}

export interface ListIssueField {
  $type: string;
  id: string;
  name: string;
  projectCustomField: {
    $type: string;
    field: ICustomFieldValue;
  };
  value: ListIssueFieldValue;
}

export interface ListIssueProject extends ProjectBase {
  plugins: {
    $type: string;
    helpDeskSettings: ProjectHelpDeskSettingsBase;
    timeTrackingSettings: TimeTrackingSettings;
  };
}

export interface IssueOnListS extends EntityBase {
  created: number;
  fields: Array<ListIssueField>;
  idReadable: string;
  project: ListIssueProject;
  reporter: UserBase;
  resolved: number | null;
  summary: string;
}

export interface IssueOnListM extends IssueOnListS {
  tags: Array<TagBase>;
  updated: number;
}

export interface IssueOnListL extends IssueOnListM {
  trimmedDescription: string | null;
}

export type ListIssue = IssueOnListS | IssueOnListM | IssueOnListL;

export type IssueOnList = ListIssue & {
  fieldHash: {
    key: string;
    value: ListIssueFieldValue;
  };
};

export interface IssueFull extends BaseIssue {
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
> & {project: Partial<Project>; canUpdateVisibility: boolean};

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
