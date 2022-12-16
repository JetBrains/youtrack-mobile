import { deepClone, deepMixIn } from './deepClone';

describe('deepClone', function() {
  it('should clone object', function() {
    const source = {
      foo: {bar: 'bar'},
      zoo: 'zoo',
    };
    const clone = deepClone(source);
    expect(clone).toEqual(source);
    expect(clone !== source).toEqual(true);
    expect(clone.foo !== source.foo).toEqual(true);
  });

  describe('deepMixIn', function() {
    it('should mixin objects', function() {
      expect(deepMixIn({foo: 'foo'}, {bar: 'bar'})).toEqual({
        foo: 'foo',
        bar: 'bar',
      });
    });

    it('should mixin arrays', function() {
      expect(deepMixIn([{foo: 'foo'}], [{bar: 'bar'}])).toEqual([{
        foo: 'foo',
        bar: 'bar',
      }]);
    });
  });
});
