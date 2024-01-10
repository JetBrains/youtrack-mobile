import type {CustomField} from './CustomFields';
import {Project} from 'types/Project';

export type PredefinedFilterField = {
  $type: 'PredefinedFilterField';
  defaultSortAsc: boolean;
  id: string;
  name: string;
  sortablePresentation: string;
};
export type IssueFieldSortProperty = {
  $type: 'IssueFieldSortProperty' | 'RelevanceSortProperty';
  asc: boolean;
  id: string;
  localizedName?: string;
  readOnly?: boolean;
  sortField: PredefinedFilterField;
};
export type CustomFilterField = {
  $type: 'CustomFilterField';
  aggregateable: boolean;
  customField: CustomField;
  defaultSortAsc: boolean;
  id: string;
  name: string;
  presentation: string;
  projects: Array<Partial<Project>>;
  sortable: boolean;
  sortablePresentation: string;
};
export type SearchSuggestions = {
  $type: 'SearchSuggestions';
  query: string;
  sortProperties: IssueFieldSortProperty[];
};
