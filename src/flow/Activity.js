/* @flow */

import type {Attachment, IssueComment, IssueProject} from './CustomFields';
import type {IssueFull} from './Issue';
import type {User} from './User';
import type {PullRequest, VCSActivity} from './Vcs';

type EventBase = {
  id: string,
  name: string,
  text: string,
  color: {id: string}
}

type ActivityWork = EventBase & {
  $type: string;
  date: number;
  type: {name: string},
  duration: {minutes: number}
}

export type ActivityItem = IssueProject | IssueComment | Attachment | IssueFull | ActivityWork | string | null;

export type Activity = {
  $type?: string,
  id: string,
  hidden?: boolean,
  category: {id: string, $type?: string},
  timestamp: number,
  targetMember: Object,
  targetSubMember?: Object,
  authorGroup?: {
    icon: string,
    name: string
  } | null,
  author: User,
  target: {$type?: string, id: string, created: number, usesMarkdown: boolean},
  field: Object,
  added: ActivityItem | Array<ActivityItem>,
  removed: ActivityItem | Array<ActivityItem>,

  comment?: IssueComment,
  work?: ActivityWork,
  vcs?: VCSActivity,
  merged?: boolean,

  key?: boolean,
  lastGroup?: boolean,
  root?: boolean,
  pullRequest?: PullRequest,
}

export type ActivityType = {
  id: string,
  name: string
}

export type ActivityPositionData = { activity: Activity, index: number };

export type ActivityChange = {
  added: ActivityItem,
  removed: ActivityItem
};

export type ActivityChangeText = {
  added: string,
  removed: string
};

type CommentAction = (comment: IssueComment) => boolean;

export type ActivityStreamCommentActions = {
  canCommentOn?: boolean,
  canDeleteComment?: CommentAction,
  canDeleteCommentAttachment?: (attachment: Attachment) => boolean,
  canDeleteCommentPermanently?: boolean,
  canRestoreComment?: CommentAction,
  canUpdateComment?: CommentAction,
  isAuthor?: CommentAction,
  onCopyCommentLink?: (comment: IssueComment) => Function,
  onDeleteAttachment?: (attachment: Attachment) => Function,
  onDeleteComment?: (comment: IssueComment) => Function,
  onDeleteCommentPermanently?: (comment: IssueComment, activityId?: string) => Function,
  onReply?: (comment: IssueComment) => any,
  onRestoreComment?: (comment: IssueComment) => Function,
  onShowCommentActions?: (comment: IssueComment, activityId: string) => Function,
  onStartEditing?: (comment: IssueComment, backendUrl?: string) => Function
}
