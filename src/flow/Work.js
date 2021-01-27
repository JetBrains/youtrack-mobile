import type {User} from './User';

export type WorkTimeSettings = {
  id: string,
  daysAWeek: number,
  minutesADay: number,
  workDays: Array<number>
}

export type WorkItemType = {
  id: string,
  name: string
};

export type WorkItemTemplate = {
  author: User,
  date: number,
  duration: {
    presentation: string
  },
  type: WorkItemType
};

export type WorkItem = WorkItemTemplate & {
  creator: User,
  id?: string,
  text: string,
  usesMarkdown: boolean
};

export type TimeTracking = {
  enabled: boolean,
  draftWorkItem: WorkItem | null,
  workItemTemplate: WorkItemTemplate
};
