import type {ColorCoding} from 'components/color-field/color-field';
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
  ordinal: number;
  color?: ColorCoding;
}

export interface WorkItemAttributeValue {
  id: string;
  name: string;
  color: ColorCoding;
  description: string | null;
  hasRunningJobs: boolean;
}

export interface WorkItemProjectAttribute {
  id: string;
  name: string;
  values: WorkItemAttributeValue[];
}

export interface ProjectTimeTrackingSettings {
  enabled: boolean;
  workItemTypes: WorkItemType[];
  attributes: WorkItemProjectAttribute[];
}

export interface WorkItemTemplate {
  author: User;
  date: number;
  duration: {
    presentation: string;
  };
  type: WorkItemType | null;
}

export interface WorkItemAttribute {
  id: string;
  name: string;
  value: WorkItemAttributeValue | null;
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
  attributes?: WorkItemAttribute[];
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
