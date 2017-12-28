import * as storage from './storage';
import {AsyncStorage as MockedStorage} from 'react-native';
import sinon from 'sinon';

describe('Storage', () => {
  let sandbox;

  beforeEach(async () => {
    sandbox = sinon.sandbox.create();
    sandbox.spy(MockedStorage, 'multiSet');
    sandbox.spy(MockedStorage, 'multiRemove');
    sandbox.stub(MockedStorage, 'multiGet').returns(Promise.resolve([
      ['foo', 'bar']
    ]));

    await storage.populateStorage();
  });

  afterEach(() => sandbox.restore());

  it('should update state on full flush', async () => {
    await storage.flushStorage({config: {}, query: 'bar'});
    storage.getStorageState().query.should.equal('bar');
  })
;
  it('should update field state on partial flush', async () => {
    await storage.flushStorage({config: {}, query: 'bar'});
    await storage.flushStoragePart({query: 'foo'});

    MockedStorage.multiSet.should.have.been.called;
    storage.getStorageState().query.should.equal('foo');
  });
});
