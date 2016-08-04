
declare type IssueOnList = {
  id: string,
  summary: string,
  resolved: boolean,
  project: IssueProject,
  numberInProject: number,
  reporter: IssueUser,
  fields: Array<CustomField>,
  fieldHash: any
}

declare type IssueFull = {
  id: string,
  summary: string,
  description: string,
  resolved: boolean,
  numberInProject: number,
  wikifiedDescription: string,
  project: IssueProject,
  reporter: IssueUser,
  fields: Array<CustomField>,
  //To continue
  fieldHash: any
};

declare type AnyIssue = IssueOnList | IssueFull;
