import ApiHelper from './api__helper';
import {IssueOnListExtended} from 'types/Issue';

describe('Api helper', () => {
  describe('fieldHash', () => {
    let issue: IssueOnListExtended;
    beforeEach(() => {
      issue = {
        fields: [
          {
            projectCustomField: {
              field: {
                name: 'testField',
              },
            },
            value: {
              name: 'bar',
            },
          },
        ],
      } as IssueOnListExtended;
    });

    it('should convert fields array to field hash object', () => {
      const hash = ApiHelper.makeFieldHash(issue);
      expect(hash).toBeTruthy();
    });
    it('should put field value into property called by field name', () => {
      const hash = ApiHelper.makeFieldHash(issue);

      expect(hash).toEqual({
        testField: {
          name: 'bar',
        },
      });
    });
  });

  describe('relative urls converter', () => {
    it('should convert relative urls to absolute', () => {
      const items = [
        {
          url: '/bar',
        },
      ];
      const fixedItems = ApiHelper.convertRelativeUrls(items, 'url', 'http://test.com');
      expect(fixedItems[0].url).toBe('http://test.com/bar');
    });

    it('should not touch absolute urls', () => {
      const items = [
        {
          url: 'https://youtrack/bar',
        },
      ];
      const fixedItems = ApiHelper.convertRelativeUrls(items, 'url', 'http://test.com');

      expect(fixedItems[0].url).toBe('https://youtrack/bar');
    });

    it('should patch all possible avatar field values', () => {
      const res = ApiHelper.patchAllRelativeAvatarUrls(
        {
          val: 'foo',
          avatarUrl: '/hub/api/rest/avatar/123',
        },
        'http://test.com'
      );

      expect(res.val).toBe('foo');
      expect(res.avatarUrl).toBe('http://test.com/hub/api/rest/avatar/123');
    });

    it('should patch nested avatar field values', () => {
      const res = ApiHelper.patchAllRelativeAvatarUrls(
        {
          val: 'foo',
          test: {
            avatarUrl: '/hub/api/rest/avatar/123',
          },
        },
        'http://test.com'
      );

      expect(res.val).toBe('foo');
      expect(res.test.avatarUrl).toBe('http://test.com/hub/api/rest/avatar/123');
    });

    it('should stript html tags from commandPreview', () => {
      expect(ApiHelper.stripHtml('foo <span class="bold">bar</span>')).toBe('foo bar');
    });

    it('should not touch clean strings while stripping tags', () => {
      expect(ApiHelper.stripHtml('foo bar')).toBe('foo bar');
    });

    describe('removeDuplicatesByPropName', () => {
      let items: Array<Record<string, any>> = [];
      beforeEach(() => {
        items = [
          {
            name: 'John',
            id: 1,
          },
          {
            name: 'Anna',
            id: 2,
          },
          {
            name: 'John',
            id: 3,
          },
        ];
      });

      it('should return an array if an object value name is not provided', function () {
        const result = ApiHelper.removeDuplicatesByPropName(items, '');

        expect(result).toEqual(items);
        expect(result).toHaveLength(items.length);
      });

      it('should remove duplicates in an array by provided object value name', () => {
        expect(ApiHelper.removeDuplicatesByPropName(items, 'name')).toHaveLength(items.length - 1);
      });
    });
  });
});
