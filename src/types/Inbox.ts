import type {Activity} from './Activity';
import type {AnyIssue, IssueOnListExtended} from './Issue';
import type {Article} from './Article';
import type {User} from './User';
import {Entity} from 'types/Entity';

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
  addedValues: ChangeValue[];
  removedValues: ChangeValue[];
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
  events: ChangeEvent[];
};
export type Metadata = {
  type: string;
  initialNotification: boolean;
  onlyViaDuplicate: boolean;
  issue?: IssueOnListExtended;
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
  $type: string;
  activities: Activity[];
  id: string;
  read: boolean;
  reasons: InboxMessageReason[];
  threadId: string;
  timestamp: number;
}
export type InboxThreadTarget = {
  $type: string,
  id: string,
  issue?: AnyIssue,
  article?: Article,
};

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
  messages: InboxThreadMessage[];
}
export interface InboxThreadGroup {
  head: Activity;
  mergedActivities: Activity[];
  messages: InboxThreadMessage[];
  comment?: Activity;
  issue?: Activity & {
    issue: any;
  };
  work?: Activity;
}
export type ThreadData = {
  entity: Entity;
  component: unknown;
  entityAtBottom?: boolean;
};
export interface InboxFolder {
  id: string;
  lastNotified: number;
  lastSeen: number;
}
export type ThreadsStateFilterId = 'all' | 'direct' | 'subscription';
