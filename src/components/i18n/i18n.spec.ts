import {i18n, i18nPlural} from './i18n';
describe('i18', () => {
  describe('i18n', () => {
    it('should return text as is', () => {
      expect(i18n('test')).toEqual('test');
    });
    it('should return empty string if text is not provided', () => {
      expect(i18n()).toEqual('');
    });
    it('should interpolate value in braces', () => {
      expect(
        i18n('Lorem {{ipsum}}', {
          ipsum: 0,
        }),
      ).toEqual('Lorem 0');
    });
    it('should interpolate several values in braces', () => {
      expect(
        i18n('Lorem {{ipsum}}, dolor sit {{amet}}', {
          ipsum: 0,
          amet: 'amet',
        }),
      ).toEqual('Lorem 0, dolor sit amet');
    });
    it('should interpolate value in braces with inner white-spaces', () => {
      expect(
        i18n('Lorem {{ ipsum  }}', {
          ipsum: 0,
        }),
      ).toEqual('Lorem 0');
    });
  });
  describe('i18nPlural', () => {
    it('should return a single form', () => {
      expect(i18nPlural(1, 'test', 'tests')).toEqual('test');
    });
    it('should return a plural form', () => {
      expect(i18nPlural(2, 'test', 'tests')).toEqual('tests');
    });
    it('should return a single form with interpolation', () => {
      expect(
        i18nPlural(1, '{{amount}} test', 'tests', {
          amount: 1,
        }),
      ).toEqual('1 test');
    });
    it('should return a plural form with interpolation', () => {
      expect(
        i18nPlural(2, '{{amount}} test', '{{amount}} tests', {
          amount: 2,
        }),
      ).toEqual('2 tests');
    });
  });
});