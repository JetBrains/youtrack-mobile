type EventBase = {
  id: string,
  name: string,
  text: string,
  color: {id: string}
}

type ActivityAttachment = EventBase & {
  url: string,
  mimeType: string,
  removed: boolean,
  thumbnailURL: string
}

type ActivityIssue = EventBase & {
  idReadable: string,
  summary: string,
  resolved: boolean,
  created: number,
  updated: number,
  project: IssueProject,
}

type ActivityWorkItem = EventBase & {
  $type: string;
  date: number;
  type: {name: string},
  duration: {minutes: number}
}

declare type AddedActivityItem = IssueProject | IssueComment | ActivityAttachment | ActivityIssue | ActivityWorkItem;
declare type RemovedActivityItem = IssueProject | IssueComment | ActivityIssue;

declare type IssueActivity = {
  id: string;
  category: {id: string},
  timestamp: number,
  targetMember: Object,
  targetSubMember: Object,
  authorGroup: {
    icon: string,
    name: string
  },
  author: IssueUser,
  target: {id: string, created: number, usesMarkdown: boolean},
  field: Object,
  added: string | Array<AddedActivityItem>,
  removed: Array<RemovedActivityItem> | null
}
