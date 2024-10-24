import {IssueFull, IssueOnList} from 'types/Issue';
import {Article} from 'types/Article';

export type Entity = Article | IssueFull | IssueOnList;

export interface EntityBase {
  $type: string;
  id: string;
}
