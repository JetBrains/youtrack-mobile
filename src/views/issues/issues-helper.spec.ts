import * as helper from './issues-helper';

import {FilterField} from 'types/CustomFields';
import {defaultIssuesFilterFieldConfig, FilterSetting} from 'views/issues/index';


describe('Issues helper', () => {
  const fieldValue = 'Open';
  const nameMock = 'State';

  describe('getFilterSettingKey', () => {
    it('should return  lower-cased key', async () => {
      expect(helper.getFilterFieldName({name: 'Test'} as FilterField)).toEqual('test');
    });
  });


  describe('createQueryFromFiltersSetting', () => {
    it('should return composed query from several filters', async () => {
      const filters = createSettingMock();

      expect(helper.createQueryFromFiltersSetting(filters)).toEqual(
        `${nameMock.toLowerCase()}:${fieldValue},${fieldValue}`
      );
    });

    it('should create a query from filters', async () => {
      const filters = createSettingMock();

      expect(helper.createQueryFromFiltersSetting(filters)).toEqual(
        `${nameMock.toLowerCase()}:${fieldValue},${fieldValue}`
      );
    });

    it('should contain the `key` field', async () => {
      const filterSettings = createSettingMock();
      expect(filterSettings[0].id).toEqual(
        nameMock.toLowerCase()
      );
    });

    it('should `project` on the first place', async () => {
      const s1 = createSettingMock(nameMock, [fieldValue, fieldValue]);
      const projectIds = ['TEST', 'SB'];
      const s2 = createSettingMock(defaultIssuesFilterFieldConfig.project, projectIds);

      expect(helper.createQueryFromFiltersSetting(s1.concat(s2))).toEqual(
        `project:${projectIds.join(',')} ${nameMock.toLowerCase()}:${fieldValue},${fieldValue}`
      );
    });
  });


  describe('convertToNonStructural', () => {
    it('should not wrap text with brackets', async () => {
      expect(helper.convertToNonStructural('')).toEqual('');
    });

    it('should not wrap text with white spaces only with brackets', async () => {
      expect(helper.convertToNonStructural('  ')).toEqual('  ');
    });

    it('should wrap text with brackets', async () => {
      expect(helper.convertToNonStructural('text')).toEqual('{text}');
    });

    it('should replace several white spaces with the one and wrap text with brackets', async () => {
      expect(helper.convertToNonStructural('bold   text   style')).toEqual('{bold text style}');
    });
  });


  describe('wrapToBraces', () => {
    it('should wrap text with white spaces', async () => {
      expect(helper.wrapToBraces('a b')).toEqual('{a b}');
    });

    it('should wrap and strim text with white spaces', async () => {
      expect(helper.wrapToBraces(' a b ')).toEqual('{a b}');
    });

    it('should not wrap text without white spaces', async () => {
      expect(helper.wrapToBraces('ab')).toEqual('ab');
    });
  });

  function createSettingMock(name: string = nameMock, values?: string[]): FilterSetting[] {
    const key = name.toLowerCase();
    return [{
      id: key,
      filterField: Array(2).fill({
        $type: 'CustomFilterField',
        id: key,
        name: key,
      }),
      selectedValues: values || Array(2).fill(fieldValue),
    }];
  }
});
