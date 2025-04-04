import type {Attachment, IssueComment} from './CustomFields';
import type {IssueFull} from './Issue';
import type {User} from './User';
import type {PullRequest} from './Vcs';
import type {Reaction} from './Reaction';
import type {ContextMenuConfig} from 'types/MenuConfig';
import {Project} from 'types/Project';

export type ActivityWork = {
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
  | Project
  | IssueComment
  | Attachment
  | IssueFull
  | ActivityWork
  | Reaction
  | string
  | null;

export interface ActivityAuthorGroup {
  icon: string;
  name: string;
}

export interface Activity {
  $type?: string;
  attachments?: Attachment[];
  id: string;
  category: {
    id: string;
    $type?: string;
  };
  timestamp: number;
  targetMember: Record<string, any> | null;
  targetSubMember?: Record<string, any>;
  authorGroup: ActivityAuthorGroup | null;
  author: User;
  target: {
    $type?: string;
    id: string;
    created: number;
    usesMarkdown: boolean;
  };
  field: {
    $type: string;
    id: string;
    presentation: string;
    customField?: {
      $type: string;
      id: string;
      fieldType: {
        $type: string;
        isMultiValue: boolean;
        valueType: string;
      };
    };
  };
  added: ActivityItem | ActivityItem[];
  removed: ActivityItem | ActivityItem[];
  pullRequest?: PullRequest;
  pinned: boolean;
}

export interface ActivityGroup extends Activity {
  comment?: Activity;
  hidden?: boolean;
  key?: boolean;
  lastGroup?: boolean;
  merged?: boolean;
  root?: boolean;
  vcs?: Activity;
  work?: Activity;
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

export interface ActivityStreamCommentActions {
  canDeleteCommentAttachment?: (attachment: Attachment) => boolean;
  canDeleteCommentPermanently?: boolean;
  canRestoreComment?: CommentAction;
  contextMenuConfig: (comment: IssueComment, activityId?: string) => ContextMenuConfig;
  onDeleteAttachment?: (attachment: Attachment) => Promise<void>;
  onDeleteComment?: (comment: IssueComment) => void;
  onDeleteCommentPermanently?: (comment: IssueComment, activityId?: string) => void;
  onLongPress?: (comment: IssueComment, activityId: string) => void;
  onRestoreComment?: (comment: IssueComment) => void;
}
