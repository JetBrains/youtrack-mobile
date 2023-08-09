import {getApi} from 'components/api/api__instance';
import {getCustomFieldName} from 'components/custom-field/custom-field-helper';
import {until} from 'util/util';

import type API from 'components/api/api';
import type {Folder} from 'types/User';
import type {IssueFieldSortProperty, SearchSuggestions} from 'types/Sorting';
import {FilterSetting} from 'views/issues/index';
import {FilterField} from 'types/CustomFields';
import QueryParser from 'components/query-assist/query-parser';

export const youtrackFields: { [key: string]: string } = {
  id: 'issue id',
  summary: 'summary',
  priority: 'priority',
  state: 'state',
  project: 'project',
  requester: 'reporter',
  assignee: 'assignee',
  updated: 'updated',
  created: 'created',
};

const doAssist = async (params: {
  context: Folder | null | undefined;
  query: string;
  sortProperties?: IssueFieldSortProperty[];
}): Promise<SearchSuggestions> => {
  const api: API = getApi();
  const {context, query = '', sortProperties} = params;
  const [error, searchSuggestions] = await until(
    api.search.getSearchSuggestions({
      folder: context?.id ? context : undefined,
      query,
      sortProperties,
    }),
  );
  return error ? ({} as any) : searchSuggestions;
};

const getSortPropertyName = (sortProperty: IssueFieldSortProperty): string => {
  const name = sortProperty
    ? sortProperty?.sortField?.sortablePresentation ||
      sortProperty.localizedName ||
      getCustomFieldName(sortProperty.sortField as any)
    : sortProperty;
  return name && sortProperty?.sortField?.$type === 'PredefinedFilterField'
    ? name.charAt(0).toUpperCase() + name.slice(1)
    : name;
};

const isRelevanceSortProperty = (sortProperty: IssueFieldSortProperty): boolean => {
  return sortProperty.$type === 'RelevanceSortProperty';
};

const createQueryFromFiltersSetting = (filters: FilterSetting[] = []): string => {
  return filters.reduce((akk: string, it: FilterSetting) => {
    const query: string = (it.selectedValues || []).map(QueryParser.wrap).join(',');
    return query ? `${akk} ${it.filterField[0].name}:${query}` : akk;
  }, '').trim();
};

const getFilterFieldKey = (filterField: FilterField) => {
  return filterField.name.toLowerCase();
};


export {
  createQueryFromFiltersSetting,
  doAssist,
  getFilterFieldKey,
  getSortPropertyName,
  isRelevanceSortProperty,
};
