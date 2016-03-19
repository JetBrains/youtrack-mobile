import ApiHelper from './api__helper';

describe('Api helper', () => {

  beforeEach(() => {

  });

  it('should convert fields array to srting', () => {
    const fields = ApiHelper.toField(['foo', 'bar'])
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
    const fields = ApiHelper.toField([{foo: ['bar']}])
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
    }])
    fields.toString().should.equal('foo(first,bar(foobar(test)))');
  });

  it('should support nested toField objects', () => {
    const fields = ApiHelper.toField([{
      foo: {
        bar: ApiHelper.toField(['first', 'second'])
      }
    }])
    fields.toString().should.equal('foo(bar(first,second))');
  });
});
