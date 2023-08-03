import type {CustomField, IssueProject} from './CustomFields';
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
  projects: Array<Partial<IssueProject>>;
  sortable: boolean;
  sortablePresentation: string;
};
export type SearchSuggestions = {
  $type: 'SearchSuggestions';
  query: string;
  sortProperties: IssueFieldSortProperty[];
};
