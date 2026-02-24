import type {AnyIssue} from 'types/Issue';
import type {Article} from 'types/Article';
import type {ProjectPlugins} from 'types/Project';

export interface EntityBase {
  $type: string;
  id: string;
}

export interface BaseEntity {
  id: string;
}

export interface BaseEntityWithRingId extends BaseEntity {
  ringId: string;
}

export interface EntityWithProject {
  project: {
    id: string;
    ringId: string;
    plugins?: ProjectPlugins;
  };
}

export interface EntityWithReporter extends EntityWithProject {
  reporter: BaseEntityWithRingId;
}

export type Entity = Article | AnyIssue;
