/* @flow */

import type {Activity} from './Activity';
import type {AnyIssue, IssueOnList} from './Issue';
import type {Article} from './Article';
import type {IssueComment} from './CustomFields';
import type {User} from './User';

type ChangeCategory = 'COMMENT' | 'CUSTOM_FIELD' | 'SPRINT' | 'SUMMARY' | 'DESCRIPTION';

export type ChangeValue = {
  id?: string,
  summary?: string,
  resolved?: number,
  name: string,
  entityId: string,
  type: string,
  value?: string,
  typeName?: string,
  category?: ChangeCategory,
  description?: string,
  workType?: string,
  date?: number,
  duration?: string,
}

export type Notification = {
  $type: string,
  id: string,
  metadata: Metadata,
  recipient: User,
  sender: User,
  issue?: Issue
}

export type ChangeEvent = {
  multiValue: boolean,
  entityId: string,
  category: ChangeCategory,
  name: string,
  addedValues: Array<ChangeValue>,
  removedValues: Array<ChangeValue>,
};

export type Reason = {
  type: string,
  name: string
};

export type ReasonDataType = 'mentionReasons' | 'tagReasons' | 'savedSearchReasons';
export type ReasonData = { [ReasonDataType]: Array<Reason> };

export type Issue = {
  created: number,
  id: string,
  project: {
    entityId: string,
    shortName: string,
    name: string
  },
  resolved: number | null,
  starred: ?boolean,
  votes: number,
  summary: string,
  description: string
};

export type IssueChange = {
  humanReadableTimeStamp: string,
  startTimestamp: number,
  endTimestamp: number,
  events: Array<ChangeEvent>
};

export type Metadata = {
  type: string,
  initialNotification: boolean,
  onlyViaDuplicate: boolean,
  issue?: IssueOnList,
  change: IssueChange,
  subject?: string,
  body?: string,
  header: string,
  reason: ?ReasonData,
  text: string,
};

export interface InboxMessageReasons {
  $type?: string;
  id: string;
  name: string;
  type: string;
}

export interface InboxThreadMessage {
  $type?: string;
  activities: Array<Activity>;
  id: string;
  muted: string;
  notified: string;
  reasons: InboxMessageReasons,
  threadId: string;
  timestamp: string;
}

export interface InboxThread {
  $type: string;
  id: string;
  notified: number;
  subject: {
    $type: string;
    id: string;
    target: (AnyIssue | IssueComment | Article);
  },
  messages: Array<InboxThreadMessage>;
}

export interface InboxThreadGroup {
  head: Activity;
  mergedActivities: Array<Activity>;
  messages: Array<InboxThreadMessage>;
  comment?: Activity;
  issue?: (Activity & {issue: any});
  work?: Activity;
}

export type ThreadEntity = ?(AnyIssue | Article);

export type ThreadData = {
  entity: ThreadEntity,
  component: any
}
