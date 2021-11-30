/* @flow */

import {getApi} from '../../components/api/api__instance';

import {getCustomFieldName} from '../../components/custom-field/custom-field-helper';
import {until} from '../../util/util';

import type API from '../../components/api/api';
import type {Folder} from '../../flow/User';
import type {IssueFieldSortProperty, SearchSuggestions} from '../../flow/Sorting';


const doAssist = async (params: {
  context: ?Folder,
  query: string,
  sortProperties?: Array<IssueFieldSortProperty>,
}): Promise<?SearchSuggestions> => {
  const api: API = getApi();
  const {context, query = '', sortProperties} = params;
  const [error, searchSuggestions] = await until(
    api.search.assist({
      folder: context?.id ? context : undefined,
      query,
      sortProperties,
    })
  );
  return error ? ({}: any) : searchSuggestions;
};

const getSortPropertyName = (sortProperty: IssueFieldSortProperty): string => {
  const name = (
    sortProperty
      ? (
        sortProperty?.sortField?.sortablePresentation ||
        sortProperty.localizedName ||
        getCustomFieldName((sortProperty.sortField: any))
      )
      : sortProperty
  );

  return (
    name && sortProperty?.sortField?.$type === 'PredefinedFilterField'
      ? name.charAt(0).toUpperCase() + name.slice(1)
      : name
  );
};

const isRelevanceSortProperty = (sortProperty: IssueFieldSortProperty): boolean => {
  return sortProperty.$type === 'RelevanceSortProperty';
};


export {
  doAssist,
  getSortPropertyName,
  isRelevanceSortProperty,
};
