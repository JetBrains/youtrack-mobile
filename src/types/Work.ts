import type {User} from './User';

export type WorkTimeSettings =
  | {
      id: string;
      daysAWeek: number;
      minutesADay: number;
      workDays: number[];
    }
  | {};

export interface WorkItemType {
  id: string | null;
  name: string;
}

export interface WorkItemTemplate {
  author: User;
  date: number;
  duration: {
    presentation: string;
  };
  type: WorkItemType | null;
}

export interface DraftWorkItem extends WorkItemTemplate {
  $type?: string;
  creator: User;
  issue: {
    id: string;
    project: {
      id: string;
      ringId: string;
    };
  };
  text: string | null;
  attributes?: {
    id: string;
    name: string;
    value: string | null;
  }
  usesMarkdown: boolean;
}


export interface WorkItem extends DraftWorkItem {
  $type: string;
  created: number;
  id: string;
}

export interface TimeTracking {
  enabled: boolean;
  draftWorkItem: WorkItem | null;
  workItemTemplate: WorkItemTemplate;
}
