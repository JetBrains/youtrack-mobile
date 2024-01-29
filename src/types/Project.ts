import {WorkItemType} from 'types/Work';

export interface ProjectTimeTrackingTimeSpent {
  id: string;
  field: {
    id: string;
    name: string;
  };
}

export interface ProjectHelpDeskSettings {
  enabled: boolean;
}

export interface ProjectPlugins {
  helpDeskSettings?: ProjectHelpDeskSettings,
  timeTrackingSettings?: {
    enabled: boolean;
    timeSpent?: ProjectTimeTrackingTimeSpent;
    workItemTypes?: WorkItemType[];
  };

}

export interface Project {
  $type?: string;
  id: string;
  name: string;
  shortName: string;
  archived: boolean;
  ringId: string;
  pinned: boolean;
  plugins?: ProjectPlugins;
  template: boolean;
}

export interface ProjectTeam {
  id: string;
  name: string;
}

export interface ProjectWithTeam extends Project {
  team: ProjectTeam;
}
