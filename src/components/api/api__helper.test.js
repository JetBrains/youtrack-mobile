import ApiHelper from './api__helper';
import ResourceTypes from './api__resource-types';

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


    describe('removeDuplicatesByPropName', () => {
      let items = [];
      beforeEach(() => {
        items = [{
          name: 'John',
          id: 1
        }, {
          name: 'Anna',
          id: 2
        }, {
          name: 'John',
          id: 3
        }];
      });

      it('should return an array if an object value name is not provided', function () {
        const result = ApiHelper.removeDuplicatesByPropName(items);
        result.should.equal(items);
        result.length.should.equal(items.length);
      });

      it('should remove duplicates in an array by provided object value name', () => {
        ApiHelper.removeDuplicatesByPropName(items, 'name').length.should.equal(2);
      });
    });
  });


  describe('isSecured', () => {
    it('should return true if an object has limited `visibility` type', () => {
      const entity = createEntity({
        $type: ResourceTypes.VISIBILITY_LIMITED
      });

      ApiHelper.isSecured(entity).should.be.true;
    });

    it('should return true if an object has `permittedGroups`', () => {
      const entity = createEntity({
          permittedGroups: [{}]
        }
      );

      ApiHelper.isSecured(entity).should.be.true;
    });

    it('should return true if an object has `permittedUsers`', () => {
      const entity = createEntity({
        permittedUsers: [{}]
      });

      ApiHelper.isSecured(entity).should.be.true;
    });

    it('should return false if an object has no `visibility`', () => {
      ApiHelper.isSecured({}).should.be.false;
    });

    it('should return false if an object has no `permittedUsers` and `permittedGroups`', () => {
      ApiHelper.isSecured(createEntity()).should.be.false;
    });


    function createEntity(visibility) {
      return {
        visibility: visibility || {}
      };
    }
  });


  describe('getEntityPresentation', function() {
    it('should return empty string if no parameter is provided', () => {
      ApiHelper.getEntityPresentation().should.equal('');
    });

    it('should return empty string if no parameter has no field to return', () => {
      ApiHelper.getEntityPresentation({}).should.equal('');
    });

    it('should return `fullName`', () => {
      const item = {
        fullName: 'fullName',
        name: 'name',
      };

      ApiHelper.getEntityPresentation(item).should.equal(item.fullName);
    });

    it('should return `name`', () => {
      const item = {
        login: 'login',
        name: 'name',
      };

      ApiHelper.getEntityPresentation(item).should.equal(item.name);
    });

    it('should return `login`', () => {
      const item = {
        presentation: 'presentation',
        login: 'login',
      };

      ApiHelper.getEntityPresentation(item).should.equal(item.login);
    });

    it('should return `presentation`', () => {
      const item = {
        presentation: 'presentation'
      };

      ApiHelper.getEntityPresentation(item).should.equal(item.presentation);
    });
  });


  describe('getVisibilityPresentation', function() {
    it('should return null if no parameter is provided', () => {
      const visibilityPresentation = ApiHelper.getVisibilityPresentation() === null;
      visibilityPresentation.should.be.true;
    });

    it('should return empty string if there are no `permittedGroups` and `permittedUsers`', () => {
      const visibilityPresentation = ApiHelper.getVisibilityPresentation({});
      visibilityPresentation.should.equal('');
    });

    it('should return combined `permittedGroups` and `permittedUsers` presentation separated by comma', () => {
      const permittedUsers = [{
        login: 'userLogin'
      }];
      const permittedGroups = [{
        name: 'groupName'
      }];

      const visibilityPresentation = ApiHelper.getVisibilityPresentation({
        visibility: {
          permittedGroups: permittedGroups,
          permittedUsers: permittedUsers
        }
      });

      visibilityPresentation.should.equal(`${permittedGroups[0].name}, ${permittedUsers[0].login}`);
    });
  });
});
