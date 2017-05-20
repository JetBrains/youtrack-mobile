import ApiHelper from './api__helper';

describe('Api helper', () => {

  describe('toField', () => {
    it('should convert fields array to srting', () => {
      const fields = ApiHelper.toField(['foo', 'bar']);
      fields.toString().should.equal('foo,bar');
    });

    it('should accept list collection as object', () => {
      ApiHelper.toField({
        id: null,
        type: null,
        name: null
      }).toString().should.equal('id,type,name');
    });

    it('should convert fields hash to srting', () => {
      const fields = ApiHelper.toField([{foo: ['bar']}]);
      fields.toString().should.equal('foo(bar)');
    });

    it('should convert included fields hash to srting', () => {
      const fields = ApiHelper.toField([{
        foo: [
          'first',
          {
            bar: {
              foobar: ['test']
            }
          }]
      }]);
      fields.toString().should.equal('foo(first,bar(foobar(test)))');
    });

    it('should support nested toField objects', () => {
      const fields = ApiHelper.toField([{
        foo: {
          bar: ApiHelper.toField(['first', 'second'])
        }
      }]);
      fields.toString().should.equal('foo(bar(first,second))');
    });
  });

  describe('fieldHash', () => {
    let issue;
    beforeEach(() => {
      issue = {
        fields: [
          {
            projectCustomField: {
              field: {
                name: 'testField'
              }
            },
            value: {foo: 'bar'}
          }
        ]
      };
    });

    it('should convert fields array to field hash object', () => {
      const hash = ApiHelper.makeFieldHash(issue);
      hash.should.be.object;
    });

    it('should put field value into property called by field name', () => {
      const hash = ApiHelper.makeFieldHash(issue);
      hash.testField.should.deep.equal({foo: 'bar'});
    });
  });

  describe('field types', () => {
    it('should convert project field type to field type', () => {
      const fieldType = ApiHelper.projectFieldTypeToFieldType('jetbrains.charisma.customfields.complex.ownedField.OwnedProjectCustomField');
      fieldType.should.equal('jetbrains.charisma.customfields.complex.ownedField.SingleOwnedIssueCustomField');
    });
  });

  describe('relative urls converter', () => {
    it('should convert relative urls to absolute', () => {
      const items = [
        {
          url: '/bar'
        }
      ];
      const fixedItems = ApiHelper.convertRelativeUrls(items, 'url', 'http://test.com');

      fixedItems[0].url.should.equal('http://test.com/bar');
    });

    it('should not touch absolute urls', () => {
      const items = [
        {
          url: 'https://youtrack/bar'
        }
      ];
      const fixedItems = ApiHelper.convertRelativeUrls(items, 'url', 'http://test.com');

      fixedItems[0].url.should.equal('https://youtrack/bar');
    });

    it('should patch all possible avatar field values', () => {
      const res = ApiHelper.patchAllRelativeAvatarUrls({
        val: 'foo',
        avatarUrl: '/hub/api/rest/avatar/123'
      }, 'http://test.com');

      res.val.should.equal('foo');
      res.avatarUrl.should.equal('http://test.com/hub/api/rest/avatar/123');
    });

    it('should patch nested avatar field values', () => {
      const res = ApiHelper.patchAllRelativeAvatarUrls({
        val: 'foo',
        test: {
          avatarUrl: '/hub/api/rest/avatar/123'
        }
      }, 'http://test.com');

      res.val.should.equal('foo');
      res.test.avatarUrl.should.equal('http://test.com/hub/api/rest/avatar/123');
    });

    it('should stript html tags from commandPreview', () => {
      ApiHelper.stripHtml('foo <span class="bold">bar</span>').should.equal('foo bar');
    });

    it('should not touch clean strings while stripping tags', () => {
      ApiHelper.stripHtml('foo bar').should.equal('foo bar');
    });
  });
});
