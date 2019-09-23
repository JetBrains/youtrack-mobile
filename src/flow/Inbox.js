import type {User} from './User';

export type ChangeValue = {
  id?: string,
  name: string,
  entityId: string,
  type: string
}

export type Notification = {
  $type: string,
  id: string,
  metadata: Metadata,
  recipient: User,
  sender: User
}

export type ChangeEvent = {
  multiValue: boolean,
  entityId: string,
  category?: 'COMMENT' | 'CUSTOM_FIELD' | 'SPRINT' | 'SUMMARY' | 'DESCRIPTION',
  name: String,
  addedValues: Array<ChangeValue>,
  removedValues: Array<ChangeValue>
};

export type Reason = {
  type: string,
  name?: string
};

export type ReasonCollection = {
  mentionReasons: Array<Reason>,
  tagReasons: Array<Reason>,
  savedSearchReasons: Array<Reason>
};

export type Issue = {
  created: number,
  id: string,
  project: {
    entityId: string,
    shortName: string,
    name: string
  },
  resolved: ?boolean,
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
  issue: Issue,
  change: IssueChange,
  subject: ?string,
  body: ?string,
  header: string,
  reason: ?ReasonCollection
};
