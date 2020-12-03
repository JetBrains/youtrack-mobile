import type {IssueComment, IssueProject} from './CustomFields';
import type {User} from './User';

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

type ActivityWork = EventBase & {
  $type: string;
  date: number;
  type: {name: string},
  duration: {minutes: number}
}

export type ActivityItem = IssueProject | IssueComment | ActivityAttachment | ActivityIssue | ActivityWork | string | null;

export type IssueActivity = {
  id: string;
  category: {id: string},
  timestamp: number,
  targetMember: Object,
  targetSubMember: Object,
  authorGroup: {
    icon: string,
    name: string
  },
  author: User,
  target: {id: string, created: number, usesMarkdown: boolean},
  field: Object,
  added: ActivityItem | Array<ActivityItem>,
  removed: ActivityItem | Array<ActivityItem>,

  comment?: IssueComment,
  work?: Object,
  merged?: boolean
}

export type ActivityType = {
  id: string,
  name: string
}

export type ActivityPositionData = { activity: IssueActivity, index: number };
