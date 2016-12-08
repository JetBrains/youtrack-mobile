
declare type IssueOnList = {
  id: string,
  summary: string,
  resolved: boolean,
  project: IssueProject,
  numberInProject: number,
  reporter: IssueUser,
  created: number,
  updated: number,
  fields: Array<CustomField>,
  fieldHash: any
}

declare type IssueFull = {
  id: string,
  summary: string,
  description: string,
  resolved: boolean,
  created: number,
  updated: number,
  numberInProject: number,
  wikifiedDescription: string,
  project: IssueProject,
  reporter: IssueUser,
  updater: IssueUser,
  fields: Array<CustomField>,
  tags: Array<Tag>,
  attachments: Array<Attachment>,
  comments: Array<IssueComment>,
  fieldHash: any
};

declare type AnyIssue = IssueOnList | IssueFull;
