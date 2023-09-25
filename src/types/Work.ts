import type {User} from './User';
export type WorkTimeSettings =
  | {
      id: string;
      daysAWeek: number;
      minutesADay: number;
      workDays: number[];
    }
  | {};
export type WorkItemType = {
  id: string | null;
  name: string;
};
export type WorkItemTemplate = {
  author: User;
  date: number;
  duration: {
    presentation: string;
  };
  type: WorkItemType | null;
  issue: {
    id: string;
    project: {
      id: string;
      ringId: string;
    };
  };
};
export type WorkItem = WorkItemTemplate & {
  $type?: string;
  created: User;
  creator?: User;
  id?: string;
  text: string | null;
  usesMarkdown: boolean;
};
export type TimeTracking = {
  enabled: boolean;
  draftWorkItem: WorkItem | null;
  workItemTemplate: WorkItemTemplate;
};
