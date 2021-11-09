/* @flow */

import ApiBase from './api__base';

import type Auth from '../auth/auth';


export default class CustomFieldsAPI extends ApiBase {
  constructor(auth: Auth) {
    super(auth);
  }

  async filterFields(queryParams: ?Object): Promise<any> {
    const queryString: string = ApiBase.createFieldsQuery(
      [
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
            {fieldType: ['id', 'isBundleType', 'valueType']},
          ],
          projects: ['id', 'name'],
        },
      ],
      queryParams,
      {encode: false, indices: false}
    );
    return this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/filterFields/?${queryString}`,
      'GET',
    );
  }



}
