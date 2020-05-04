import * as storage from './storage';
import MockedStorage from '@react-native-community/async-storage';
import sinon from 'sinon';

describe('Storage', () => {
  let sandbox;

  beforeEach(async () => {
    sandbox = sinon.sandbox.create();
    sandbox.spy(MockedStorage, 'multiSet');
    sandbox.spy(MockedStorage, 'multiRemove');
    sandbox.stub(MockedStorage, 'multiGet').returns(Promise.resolve([
      ['BACKEND_CONFIG_STORAGE_KEY', '{"foo": "bar"}'],
      ['YT_QUERY_STORAGE', 'for: me'],
      ['yt_mobile_auth', '{"foo": "bar"}']
    ]));

    await storage.populateStorage();
  });

  afterEach(() => sandbox.restore());

  it('should populate storage', async () => {
    storage.getStorageState().config.should.deep.equal({foo: 'bar'});
    storage.getStorageState().authParams.should.deep.equal({foo: 'bar'});
    storage.getStorageState().query.should.equal('for: me');
  });

  it('should update state on full flush', async () => {
    await storage.flushStorage({config: {}, query: 'bar'});
    storage.getStorageState().query.should.equal('bar');
  });

  it('should remove empty values from storage on flush', async () => {
    await storage.flushStoragePart({config: {}, query: 'bar'});
    MockedStorage.multiRemove.should.have.been.calledWith([
      'YT_DEFAULT_CREATE_PROJECT_ID_STORAGE',
      'DRAFT_ID_STORAGE_KEY',
      'YT_CURRENT_USER_STORAGE_KEY',
      'YT_CREATION_TIMESTAMP_STORAGE_KEY',
      'YT_LAST_QUERIES_STORAGE_KEY',
      'yt_mobile_issues_cache',
      'YT_IS_REGISTERED_FOR_PUSH',
      'YT_DEVICE_TOKEN',
      'YT_AGILE_ZOOMED_IN',
      'YT_LAST_ROUTE',
      'YT_CURRENT_APP_VERSION',
      'YT_ISSUE_ACTIVITIES_ENABLED_TYPES'
    ]);
  });


  it('should update field state on partial flush', async () => {
    await storage.flushStorage({config: {}, query: 'bar'});
    await storage.flushStoragePart({query: 'foo'});

    MockedStorage.multiSet.should.have.been.called;
    storage.getStorageState().query.should.equal('foo');
  });

  it('should update boolean field state on partial flush', async () => {
    await storage.flushStoragePart({agileZoomedIn: true});
    storage.getStorageState().agileZoomedIn.should.equal(true);
  });
});
