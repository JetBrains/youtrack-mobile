
declare type IssueOnList = {
  id: string,
  summary: string,
  resolved: boolean,
  project: IssueProject,
  numberInProject: number,
  reporter: IssueUser,
  created: number,
  updated: number,
  fields: Array<CustomFieldShort>,
  fieldHash: any
}

declare type IssueFull = {
  id: string,
  summary: string,
  description: string,
  resolved: boolean,
  created: number,
  updated: number,
  votes: number,
  numberInProject: number,
  wikifiedDescription: string,
  watchers: {hasStar: boolean},
  voters: {hasVote: boolean},
  project: IssueProject,
  reporter: IssueUser,
  updater: IssueUser,
  fields: Array<CustomField>,
  tags: Array<Tag>,
  attachments: Array<Attachment>,
  comments: Array<IssueComment>,
  links: Array<IssueLink>,
  fieldHash: any
};

declare type AnyIssue = IssueOnList | IssueFull;

declare type ServersideSuggestion = {
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

declare type TransformedSuggestion = {
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

declare type SuggestedCommand = {
  description: ?string,
  error: boolean,
  delete: boolean
}

declare type CommandSuggestion = {
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

declare type CommandSuggestionResponse = {
  query: string,
  caret: number,
  commands: Array<SuggestedCommand>,
  suggestions: Array<CommandSuggestion>
};

declare type SavedQuery = {
  id: string,
  name: string,
  query: string,
  isUpdatable: boolean,
  owner: {ringId: string}
}
