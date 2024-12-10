import type {Article} from 'types/Article';
import type {AnyIssue} from 'types/Issue';

export type Entity = Article | AnyIssue;

export interface EntityBase {
  $type: string;
  id: string;
}
