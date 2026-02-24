import type {EntityBase} from 'types/Entity';
import type {WorkItemAttributeValue, WorkItemType} from 'types/Work';

export interface ProjectTimeTrackingTimeSpent {
  id: string;
  field: {
    id: string;
    name: string;
  };
}

export interface ProjectEntity extends EntityBase {
  name: string;
  ringId: string;
}

export interface ProjectHelpDeskSettingsBase {
  $type: string;
  enabled: boolean;
}

export interface ProjectHelpDeskSettings extends ProjectHelpDeskSettingsBase {
  defaultForm: {
    title: string;
    uuid: string;
  };
}

export interface ProjectWithPlugins extends ProjectEntity {
  plugins: {
    helpDeskSettings: ProjectHelpDeskSettingsBase;
  };
}

export interface ProjectBase extends ProjectEntity {
  archived: boolean;
  restricted: boolean;
  shortName: string;
  template: boolean;
}

export interface ProjectTimeTrackingSettings {
  enabled: boolean;
  timeSpent: ProjectTimeTrackingTimeSpent;
  workItemTypes: WorkItemType[];
  attributes: Array<{
    id: string;
    name: string;
    values: WorkItemAttributeValue[];
  }>;
}

export interface ProjectPlugins {
  helpDeskSettings: ProjectHelpDeskSettingsBase;
  timeTrackingSettings?: ProjectTimeTrackingSettings;
}

export interface Project extends ProjectBase {
  pinned: boolean;
  plugins?: ProjectPlugins;
}

export interface UserProject extends ProjectEntity {
  shortName: string;
  pinned: boolean;
  plugins: {
    helpDeskSettings: {
      enabled: boolean,
    };
  };
  restricted: boolean;
}

export interface ProjectHelpdesk extends ProjectEntity {
  archived: boolean;
  shortName: string;
  plugins: {
    helpDeskSettings: ProjectHelpDeskSettings;
  };
  restricted: boolean;
}

export interface ProjectTeam extends EntityBase {
  name: string;
}

export interface ProjectWithTeam extends Project {
  team: ProjectTeam;
}
