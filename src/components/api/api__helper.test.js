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
});
