import type {IssueProject, CustomFieldShort, CustomField, Tag, Attachment, IssueComment, IssueLink} from './CustomFields';
import type {User} from './User';

export type IssueOnList = {
  id: string,
  idReadable: string,
  summary: string,
  resolved: boolean,
  project: IssueProject,
  reporter: User,
  created: number,
  updated: number,
  fields: Array<CustomFieldShort>,
  fieldHash: any
}

export type IssueFull = {
  id: string,
  idReadable: string,
  summary: string,
  description: string,
  resolved: boolean,
  created: number,
  updated: number,
  votes: number,
  wikifiedDescription: string,
  watchers: {hasStar: boolean},
  voters: {hasVote: boolean},
  project: IssueProject,
  reporter: User,
  updater: User,
  fields: Array<CustomField>,
  tags: Array<Tag>,
  attachments: Array<Attachment>,
  comments?: Array<IssueComment>,
  links: Array<IssueLink>,
  fieldHash: any
};

export type AnyIssue = IssueOnList | IssueFull;

export type ServersideSuggestion = {
  o: string,
  d: string,
  hd: string,
  pre: string,
  suf: string,
  ms: number,
  me: number,
  cp: number,
  cs: number,
  ce: number
};

export type TransformedSuggestion = {
  prefix: string,
  option: string,
  suffix: string,
  description: string,
  matchingStart: number,
  matchingEnd: number,
  caret: number,
  completionStart: number,
  completionEnd: number
}

export type SuggestedCommand = {
  description: ?string,
  error: boolean,
  delete: boolean
}

export type CommandSuggestion = {
  id: string,
  caret: number,
  comment: string,
  completionStart: number,
  completionEnd: number,
  matchingStart: number,
  matchingEnd: number,
  description: string,
  option: string,
  prefix: ?string,
  suffix: string
}

export type CommandSuggestionResponse = {
  query: string,
  caret: number,
  commands: Array<SuggestedCommand>,
  suggestions: Array<CommandSuggestion>
};

export type SavedQuery = {
  id: string,
  name: string,
  query: string,
  isUpdatable: boolean,
  owner: {ringId: string}
}
