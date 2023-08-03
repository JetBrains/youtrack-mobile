import ApiBase from './api__base';
import ApiHelper from 'components/api/api__helper';
import UserAPI from './api__user';

import {FilterField, FilterFieldValue} from 'types/CustomFields';


export default class FilterFields extends ApiBase {

  async filterFields(url: string, prefix: string = '', query: string = ''): Promise<any[]> {
    const fields = ApiHelper.toField([
      'id',
      'presentation',
      'query',
      'name',
    ]);
    const queryString: string = UserAPI.createFieldsQuery(
      fields,
      {
        $top: 100,
        query,
        prefix,
        type: 'Issue',
      }
    );
    return await this.makeAuthorizedRequest(
      `${url}?${queryString}`,
      'GET'
    );
  }

  async getFilterFields(query?: string): Promise<FilterField[]> {
    return this.filterFields(`${this.youTrackUrl}/api/filterFields`, query);
  }

  async filterFieldValues(id: string, prefix: string, query: string): Promise<FilterFieldValue[]> {
    return this.filterFields(`${this.youTrackUrl}/api/filterFields/${id}/values`, prefix, query);
  }
}
