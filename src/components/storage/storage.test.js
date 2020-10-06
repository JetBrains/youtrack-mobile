import * as storage from './storage';
import MockedStorage from '@react-native-community/async-storage';
import sinon from 'sinon';

let queryMock;
describe('Storage', () => {
  let sandbox;
  queryMock = 'for: me';

  beforeEach(async () => {
    jest.restoreAllMocks();

    sandbox = sinon.sandbox.create();
    sandbox.spy(MockedStorage, 'multiSet');
    sandbox.spy(MockedStorage, 'multiRemove');
    sandbox.stub(MockedStorage, 'multiGet').returns(Promise.resolve([
      ['BACKEND_CONFIG_STORAGE_KEY', '{"foo": "bar"}'],
      ['YT_QUERY_STORAGE', queryMock],
      ['yt_mobile_auth', '{"foo": "bar"}']
    ]));

    await storage.populateStorage();
  });

  afterEach(() => sandbox.restore());

  it('should populate storage', async () => {
    storage.getStorageState().config.should.deep.equal({foo: 'bar'});
    storage.getStorageState().authParams.should.deep.equal({foo: 'bar'});
    storage.getStorageState().query.should.equal(queryMock);
  });

  it('should update state on full flush', async () => {
    await storage.flushStorage({config: {}, query: 'bar'});
    storage.getStorageState().query.should.equal('bar');
  });

  it('should return prev state if flush throws', async () => {
    jest.spyOn(storage, 'flushStorage').mockRejectedValueOnce('Device is running low on available storage space');
    await storage.flushStorage({query: 'bar'}).catch(() => {
      storage.getStorageState().query.should.equal(queryMock);
    });

  });

  it('should remove empty values from storage on flush', async () => {
    await storage.flushStoragePart({config: {}, query: 'bar'});
    MockedStorage.multiRemove.should.have.been.calledWith([
      'YT_DEFAULT_CREATE_PROJECT_ID_STORAGE',
      'YT_PROJECTS_STORAGE',
      'DRAFT_ID_STORAGE_KEY',
      'YT_CURRENT_USER_STORAGE_KEY',
      'YT_CREATION_TIMESTAMP_STORAGE_KEY',
      'YT_SEARCH_CONTEXT_STORAGE',
      'YT_LAST_QUERIES_STORAGE_KEY',
      'yt_mobile_issues_cache',
      'YT_IS_REGISTERED_FOR_PUSH',
      'YT_DEVICE_TOKEN',
      'YT_AGILE_ZOOMED_IN',
      'YT_AGILE_LAST_SPRINT',
      'YT_AGILE_QUERY',
      'YT_LAST_ROUTE',
      'YT_CURRENT_APP_VERSION',
      'YT_ISSUE_ACTIVITIES_ENABLED_TYPES',
      'YT_USER_PERMISSIONS',
      'YT_AGILE_DEFAULT_BOARD',
      'YT_THEME_MODE',
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
