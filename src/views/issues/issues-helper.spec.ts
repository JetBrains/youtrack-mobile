import * as helper from './issues-helper';

import {FilterField} from 'types/CustomFields';
import {FilterSetting} from 'views/issues/index';


describe('Issues helper', () => {
  const fieldValue = 'Open';
  const filterFieldNameMock = 'state';

  describe('getFilterSettingKey', () => {
    it('should return  lower-cased key', async () => {
      expect(helper.getFilterFieldKey({name: 'Test'} as FilterField)).toEqual('test');
    });
  });


  describe('createQueryFromFiltersSetting', () => {
    it('should return composed query from several filters', async () => {
      const filters = createSettingMock();

      expect(helper.createQueryFromFiltersSetting(filters)).toEqual(
        `${filterFieldNameMock}:${fieldValue},${fieldValue}`
      );
    });

    it('should wrap terms with white space', async () => {
      const filterValueWithWhiteSpace = 'No State';
      const filters = createSettingMock(filterFieldNameMock, filterValueWithWhiteSpace);
      const value = `{${filterValueWithWhiteSpace}}`;

      expect(helper.createQueryFromFiltersSetting(filters)).toEqual(
        `${filterFieldNameMock}:${value},${value}`
      );
    });
  });


  function createSettingMock(name: string = filterFieldNameMock, value: string = fieldValue): FilterSetting[] {
    return [{
      filterField: Array(2).fill({
        $type: '',
        id: '',
        name: name,
      }),
      selectedValues: Array(2).fill(value),
    }];
  }
});
