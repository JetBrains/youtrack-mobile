import Cache from './cache';
import {AsyncStorage as MockedStorage} from 'react-native';
import sinon from 'sinon';

const TEST_KEY = 'test-key';

describe('Cache', () => {
  let cache;
  beforeEach(() => {
    sinon.spy(MockedStorage, 'setItem');
    sinon.stub(MockedStorage, 'getItem').returns(Promise.resolve('{"foo":"bar"}'));
    cache = new Cache(TEST_KEY);
  });

  afterEach(() => {
    MockedStorage.setItem.restore();
    MockedStorage.getItem.restore();
  });

  it('should write object in cache as JSON', async () => {
    await cache.store({foo: 'bar'});
    MockedStorage.setItem.should.have.been.calledWith(TEST_KEY, '{"foo":"bar"}');
  });

  it('should read object back as object', async () => {
    await cache.store({foo: 'bar'});
    const storedObj = await cache.read();
    storedObj.should.deep.equal({foo: 'bar'});
  });

});
