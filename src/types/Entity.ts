import type {AnyIssue} from 'types/Issue';
import type {Article} from 'types/Article';
import type {ProjectHelpDeskSettingsBase} from 'types/Project';
import type {ProjectTimeTrackingSettings} from 'types/Work';

export type Entity = Article | AnyIssue;

export type EntityWithProject = {
  project: {
    id: string;
    plugins?: {
      helpDeskSettings: ProjectHelpDeskSettingsBase;
      timeTrackingSettings?: ProjectTimeTrackingSettings;
    };
  };
};

export interface EntityBase {
  $type: string;
  id: string;
}
