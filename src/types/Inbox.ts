import type {Activity} from './Activity';
import type {AnyIssue, IssueOnList} from './Issue';
import type {Article} from './Article';
import type {IssueComment} from './CustomFields';
import type {User} from './User';
type ChangeCategory =
  | 'COMMENT'
  | 'CUSTOM_FIELD'
  | 'SPRINT'
  | 'SUMMARY'
  | 'DESCRIPTION';
export type ChangeValue = {
  id?: string;
  summary?: string;
  resolved?: number;
  name: string;
  entityId: string;
  type: string;
  value?: string;
  typeName?: string;
  category?: ChangeCategory;
  description?: string;
  workType?: string;
  date?: number;
  duration?: string;
};
export type Notification = {
  $type: string;
  id: string;
  metadata: Metadata;
  recipient: User;
  sender: User;
  issue?: Issue;
};
export type ChangeEvent = {
  multiValue: boolean;
  entityId: string;
  category: ChangeCategory;
  name: string;
  addedValues: Array<ChangeValue>;
  removedValues: Array<ChangeValue>;
};
export type Reason = {
  type: string;
  name: string;
};
export type ReasonDataType =
  | 'mentionReasons'
  | 'tagReasons'
  | 'savedSearchReasons';
export type ReasonData = Record<ReasonDataType, Array<Reason>>;
export type Issue = {
  created: number;
  id: string;
  project: {
    entityId: string;
    shortName: string;
    name: string;
  };
  resolved: number | null;
  starred: boolean | null | undefined;
  votes: number;
  summary: string;
  description: string;
};
export type IssueChange = {
  humanReadableTimeStamp: string;
  startTimestamp: number;
  endTimestamp: number;
  events: Array<ChangeEvent>;
};
export type Metadata = {
  type: string;
  initialNotification: boolean;
  onlyViaDuplicate: boolean;
  issue?: IssueOnList;
  change: IssueChange;
  subject?: string;
  body?: string;
  header: string;
  reason: ReasonData | null | undefined;
  text: string;
};
export interface InboxMessageReason {
  $type: string;
  id: string;
  name: string;
  type: 'search' | 'tag';
}
export interface InboxThreadMessage {
  $type?: string;
  activities: Array<Activity>;
  id: string;
  muted: string;
  notified: string;
  read: boolean;
  reasons: InboxMessageReason[];
  threadId: string;
  timestamp: string;
}
export type InboxThreadTarget = AnyIssue | IssueComment | Article;
export interface InboxThread {
  $type: string;
  id: string;
  muted: boolean;
  notified: number;
  subject: {
    $type: string;
    id: string;
    target: InboxThreadTarget;
  };
  messages: Array<InboxThreadMessage>;
}
export interface InboxThreadGroup {
  head: Activity;
  mergedActivities: Array<Activity>;
  messages: Array<InboxThreadMessage>;
  comment?: Activity;
  issue?: Activity & {
    issue: any;
  };
  work?: Activity;
}
export type ThreadEntity = AnyIssue | Article;
export type ThreadData = {
  entity: ThreadEntity;
  component: any;
  entityAtBottom?: boolean;
};
export interface InboxFolder {
  id: string;
  lastNotified: number;
  lastSeen: number;
}
export type ThreadsStateDataKey = 'all' | 'direct' | 'subscription';
