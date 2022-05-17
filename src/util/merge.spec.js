import { merge } from './merge';

describe('merge', function() {
  it('should merge two objects', function() {
    const out = merge({foo: 'foo', bar: 'bar'}, {'foo': 'zoo', koo: 'koo'});
    expect(out).toEqual({
      foo: 'zoo',
      bar: 'bar',
      koo: 'koo',
    });
  });

  it('should merge object with primitive', function() {
    expect(merge({foo: {x: 'x'}}, {foo: 'zoo'})).toEqual({
      foo: 'zoo',
    });
    expect(merge({foo: 'x'}, {foo: {zoo: 'zoo'}})).toEqual({
      foo: {zoo: 'zoo'},
    });
  });

  it('should merge object with array', function() {
    expect(merge({foo: {x: 'x'}}, {foo: ['zoo']})).toEqual({
      foo: ['zoo'],
    });
    expect(merge({foo: ['x']}, {foo: {zoo: 'zoo'}})).toEqual({
      foo: {zoo: 'zoo'},
    });
  });

  it('should merge arrays', function() {
    expect(merge({foo: ['x']}, {foo: ['y']})).toEqual({
      foo: ['y'],
    });
    expect(merge({foo: ['x', 'z']}, {foo: ['y']})).toEqual({
      foo: ['y'],
    });
    expect(merge({foo: ['x']}, {foo: []})).toEqual({
      foo: [],
    });
    expect(merge({foo: [{bar: 'x', zoo: 'zoo'}]}, {foo: [{bar: 'y'}]})).toEqual({
      foo: [{bar: 'y'}],
    });
  });
});
