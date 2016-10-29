import Cache from './cache';
import {AsyncStorage as MockedStorage} from 'react-native';

const TEST_KEY = 'test-key';

describe('Cache', () => {
  let cache;
  beforeEach(() => {
    cache = new Cache(TEST_KEY);
  });

  it('should write object in cache as JSON', () => {
    return cache.store({foo: 'bar'})
      .then(() => MockedStorage.getItem(TEST_KEY))
      .then(storedValue => {
        storedValue.should.equal('{"foo":"bar"}');
      });
  });

  it('should read object back as object', () => {
    return cache.store({foo: 'bar'})
      .then(() => cache.read())
      .then(storedObj => {
        storedObj.should.deep.equal({foo: 'bar'});
      });
  });

});
