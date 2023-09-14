import ApiBase from './api__base';

import {FilterField, FilterFieldValue} from 'types/CustomFields';


export default class FilterFields extends ApiBase {

  async filterFields(url: string, prefix: string = '', query: string = ''): Promise<any[]> {
    const fields = [
      'id',
      'presentation',
      'query',
      'name',
    ];
    return await this.makeAuthorizedRequest(
      `${url}?%24top=100&fields=${fields.join(',')}&query=${encodeURIComponent(query)}&prefix=${encodeURIComponent(prefix)}&type=Issue`,
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
