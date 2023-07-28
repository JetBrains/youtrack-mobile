import ApiBase from './api__base';

import {toField} from 'util/to-field';

import {Filter} from 'types/CustomFields';

const sortByFields = toField([
  'id',
  '$type',
  'presentation',
  'name',
  'aggregateable',
  'defaultSortAsc',
  'sortable',
  'sortablePresentation',
  'instant',
  {
    customField: [
      '$type',
      'id',
      'name',
      'localizedName',
      'ordinal',
      {
        fieldType: ['id', 'isBundleType', 'valueType'],
      },
    ],
    projects: ['id', 'name'],
  },
]);

const filterFields = toField([
  '$type',
  'id',
  'name',
  /*{
   customField: [
   '$type',
   'id',
   'name',
   'aliases',
   'localizedName',
   {
   fieldType: [
   'valueType',
   'presentation',
   'isBundleType',
   'isMultiValue',
   ],
   },
   ],
   },*/
]);

const filtersDefaultParams = {
  getUnusedVisibleFields: true,
  fieldTypes: ['custom', 'predefined'],
};


export default class CustomFieldsAPI extends ApiBase {

  async filterFields(fields: Record<string, any>, params: Record<string, any>, options?: Record<string, any>): Promise<any> {
    const fieldsQuery: string = ApiBase.createFieldsQuery(
      fields,
      params,
      options,
    );
    return this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/filterFields/?${fieldsQuery}`,
      'GET',
    );
  }

  async getSortableFilters(contextId?: string | null): Promise<Filter[]> {
    return this.filterFields(
      sortByFields,
      {
      fld: contextId || undefined,
      ...filtersDefaultParams,
    }, {
      encode: false,
      indices: false,
    });
  }

  async getFilters(): Promise<Filter[]> {
    return this.filterFields(filterFields, filtersDefaultParams);
  }
}
