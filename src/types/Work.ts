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
    $type: string;
    presentation: string;
  };
  type: null;
}

export interface WorkItem extends Omit<WorkItemTemplate, 'type'> {
  $type?: string;
  created: number;
  creator?: User;
  id?: string;
  issue: {
    id: string;
    project: {
      id: string;
      ringId: string;
    };
  };
  text: string | null;
  type: WorkItemType | null;
  usesMarkdown: boolean;
}

export interface TimeTracking {
  enabled: boolean;
  draftWorkItem: WorkItem | null;
  workItemTemplate: WorkItemTemplate;
}
