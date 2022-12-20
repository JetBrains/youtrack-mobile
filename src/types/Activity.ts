import type {Attachment, IssueComment, IssueProject} from './CustomFields';
import type {IssueFull} from './Issue';
import type {User} from './User';
import type {PullRequest, VCSActivity} from './Vcs';
import type {Reaction} from './Reaction';
type ActivityWork = {
  id: string;
  name: string;
  text: string;
  color: {
    id: string;
  };
  $type: string;
  date: number;
  type: {
    name: string;
  };
  duration: {
    minutes: number;
  };
  issue: {
    id: string;
    project: {
      ringId: string;
    };
  };
};
export type ActivityItem =
  | IssueProject
  | IssueComment
  | Attachment
  | IssueFull
  | ActivityWork
  | Reaction
  | string
  | null;
export interface Activity {
  $type?: string;
  id: string;
  category: {
    id: string;
    $type?: string;
  };
  timestamp: number;
  targetMember: Record<string, any>;
  targetSubMember?: Record<string, any>;
  authorGroup?: {
    icon: string;
    name: string;
  } | null;
  author: User;
  target: {
    $type?: string;
    id: string;
    created: number;
    usesMarkdown: boolean;
  };
  field: Record<string, any>;
  added: ActivityItem | Array<ActivityItem>;
  removed: ActivityItem | Array<ActivityItem>;
  pullRequest?: PullRequest;
}
export interface ActivityGroup extends Activity {
  comment?: IssueComment;
  hidden?: boolean;
  key?: boolean;
  lastGroup?: boolean;
  merged?: boolean;
  root?: boolean;
  vcs?: VCSActivity;
  work?: ActivityWork;
  events?: Activity[];
}
export type ActivityType = {
  id: string;
  name: string;
};
export type ActivityPositionData = {
  activity: Activity;
  index: number;
};
export type ActivityChangeText = {
  added: string;
  removed: string;
};
type CommentAction = (comment: IssueComment) => boolean;
export type ActivityStreamCommentActions = {
  canCommentOn?: boolean;
  canDeleteComment?: CommentAction;
  canDeleteCommentAttachment?: (attachment: Attachment) => boolean;
  canDeleteCommentPermanently?: boolean;
  canRestoreComment?: CommentAction;
  canUpdateComment?: CommentAction;
  isAuthor?: CommentAction;
  onCopyCommentLink?: (comment: IssueComment) => (...args: Array<any>) => any;
  onDeleteAttachment?: (attachment: Attachment) => (...args: Array<any>) => any;
  onDeleteComment?: (comment: IssueComment) => (...args: Array<any>) => any;
  onDeleteCommentPermanently?: (
    comment: IssueComment,
    activityId?: string,
  ) => (...args: Array<any>) => any;
  onReply?: (comment: IssueComment) => any;
  onRestoreComment?: (comment: IssueComment) => (...args: Array<any>) => any;
  onShowCommentActions?: (
    comment: IssueComment,
    activityId: string,
  ) => (...args: Array<any>) => any;
  onStartEditing?: (
    comment: IssueComment,
    backendUrl?: string,
  ) => (...args: Array<any>) => any;
};
