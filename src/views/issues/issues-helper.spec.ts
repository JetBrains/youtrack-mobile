import * as helper from './issues-helper';

import {FilterField} from 'types/CustomFields';
import {FiltersSetting} from 'views/issues/index';


describe('Issues helper', () => {
  const query1 = 'State: Open';

  describe('getFilterSettingKey', () => {
    it('should return  lower-cased key', async () => {
      expect(helper.getFilterSettingKey({name: 'Test'} as FilterField)).toEqual('test');
    });
  });


  describe('createQueryFromFiltersSetting', () => {
    it('should return composed query from several filters', async () => {
      const filters = createSettingMock('first');

      expect(helper.createQueryFromFiltersSetting(filters)).toEqual(
        `${query1} ${query1}`
      );
    });
  });


  describe('getFiltersSettingsData', () => {
    it('should return composed data', async () => {
      const filters = createSettingMock('first');

      expect(helper.getFiltersSettingsData(filters, [filters.first?.filterField[0]!])).toEqual({
        key: 'first',
        filterField: filters.first!.filterField,
        selectedValues: filters.first?.selectedValues,
      });
    });
  });


  function createSettingMock(name: string): FiltersSetting {
    return {
      [name]: {
        filterField: Array(2).fill({
          $type: '',
          id: '',
          name: name,
        }),
        selectedValues: Array(2).fill({
          $type: '',
          id: '',
          presentation: '',
          query: query1,
        }),
      },
    };
  }
});
