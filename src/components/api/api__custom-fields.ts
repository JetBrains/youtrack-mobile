import ApiBase from './api__base';

import {sortAlphabetically} from 'components/search/sorting';
import {toField} from 'util/to-field';

import type {FilterField, PredefinedFilterFieldBase} from 'types/Sorting';

const sortByFields = toField([
  'id',
  '$type',
  'presentation',
  'name',
  'defaultSortAsc',
  'sortable',
  'sortablePresentation',
  {
    customField: [
      '$type',
      'id',
      'name',
      'localizedName',
      {
        fieldType: ['id', 'valueType'],
      },
    ],
    projects: ['id', 'name'],
  },
]);

const filterFields = toField([
  '$type',
  'id',
  'name',
  'customField(id,name,localizedName)',
]);

const filtersDefaultParams = {
  getUnusedVisibleFields: true,
  fieldTypes: ['custom', 'predefined'],
};


export default class CustomFieldsAPI extends ApiBase {
  async filterFields(
    fields: Record<string, any>,
    params: Record<string, any>,
    options?: Record<string, any>
  ): Promise<any> {
    const fieldsQuery: string = ApiBase.createFieldsQuery(fields, params, options);
    return this.makeAuthorizedRequest(`${this.youTrackApiUrl}/filterFields/?${fieldsQuery}`, 'GET');
  }

  async getSortableFilters(contextId?: string | null): Promise<FilterField[]> {
    return this.filterFields(
      sortByFields,
      {
        fld: contextId || undefined,
        ...filtersDefaultParams,
      },
      {
        encode: false,
        indices: false,
      }
    );
  }

  async getFiltersCustom(contextId: string | null, query: string = ''): Promise<FilterField[]> {
    return this.filterFields(filterFields, {
      fld: contextId ?? undefined,
      query,
      getUnusedVisibleFields: true,
      fieldTypes: 'custom',
    });
  }
  async getFiltersPredefined(contextId: string | null, query: string = ''): Promise<FilterField[]> {
    return this.filterFields(filterFields, {
      fld: contextId ?? undefined,
      query,
      fieldTypes: 'predefined',
    });
  }

  async getFilters(
    contextId: string | null,
    query: string = ''
  ): Promise<Array<FilterField | PredefinedFilterFieldBase>> {
    const custom = await this.getFiltersCustom(contextId, query);
    const predefined = await this.getFiltersPredefined(contextId, query);
    return new Array<FilterField | PredefinedFilterFieldBase>()
      .concat(custom)
      .concat(predefined)
      .sort(sortAlphabetically);
  }
}
