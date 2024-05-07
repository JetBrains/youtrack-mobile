import type {CustomField, ICustomField} from './CustomFields';
import type {Project} from 'types/Project';

export interface PredefinedFilterField {
  $type: 'PredefinedFilterField';
  defaultSortAsc: boolean;
  id: string;
  name: string;
  sortablePresentation: string;
  presentation: string;
  sortable: true;
}

export interface FilterField {
  $type: string;
  id: string;
  name: string;
  presentation: string;
  sortablePresentation: string;
  sortable: boolean;
  defaultSortAsc: boolean;
  customField: ICustomField;
  projects: Array<{
    id: string;
    name: string;
  }>;
}

export interface FilterFieldValue {
  $type: string;
  id: string;
  presentation: string;
  query: string;
}

export type IssueFieldSortProperty = {
  $type: 'IssueFieldSortProperty' | 'RelevanceSortProperty';
  asc: boolean;
  id: string;
  sortField: PredefinedFilterField | FilterField;
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
