import {getApi} from 'components/api/api__instance';
import {getCustomFieldName} from 'components/custom-field/custom-field-helper';
import {until} from 'util/util';

import type API from 'components/api/api';
import type {Folder} from 'types/User';
import type {IssueFieldSortProperty, SearchSuggestions} from 'types/Sorting';
import {FilterSetting, FiltersSetting} from 'views/issues/index';
import {FilterField, FilterFieldValue} from 'types/CustomFields';

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

const createQueryFromFiltersSetting = (filters: FiltersSetting = {}): string => {
  return Object.keys(filters).reduce((akk: string, name: string) => {
    const query: string[] = (filters[name]?.selectedValues || []).map(i => i.query);
    return `${akk} ${query.join(' ')}`;
  }, '').trim();
};

const getFilterSettingKey = (filterField: FilterField) => {
  return filterField.name.toLowerCase();
};

const getFiltersSettingsData = (filtersSetting: FiltersSetting, filterFields: FilterField[]) => {
  const key: string = getFilterSettingKey(filterFields[0]);
  const filter: FilterSetting | { selectedValues: FilterFieldValue[] } = (
    filtersSetting?.[key] ||
    {selectedValues: []}
  );
  return {
    key,
    ...filter,
  };
};

export type FilterFieldMap = { [key: string]: FilterField[] };


export {
  createQueryFromFiltersSetting,
  doAssist,
  getFiltersSettingsData,
  getFilterSettingKey,
  getSortPropertyName,
  isRelevanceSortProperty,
};
