import MockedStorage from '@react-native-async-storage/async-storage';
import sinon from 'sinon';
import * as storage from './storage';
import * as storageHelper from './storage__oauth';
import EncryptedStorage from 'react-native-encrypted-storage';
let queryMock;
let sandbox;
let configMock;
describe('Storage', () => {
  beforeEach(() => jest.restoreAllMocks());
  describe('Change storage', () => {
    beforeEach(async () => {
      queryMock = 'for: me';
      configMock = {
        foo: 'bar',
      };
      sandbox = sinon.createSandbox();
      sandbox.spy(MockedStorage, 'multiSet');
      sandbox.spy(MockedStorage, 'multiRemove');
      sandbox.stub(MockedStorage, 'multiGet').returns(
        Promise.resolve([
          ['BACKEND_CONFIG_STORAGE_KEY', '{"foo": "bar"}'],
          ['YT_QUERY_STORAGE', queryMock],
          ['yt_mobile_auth_key', '123'],
        ]),
      );
      await storage.populateStorage();
    });
    afterEach(() => sandbox.restore());
    it('should populate storage', async () => {
      storage.getStorageState().config.should.deep.equal(configMock);
      storage.getStorageState().query.should.equal(queryMock);
    });
    it('should update state on full flush', async () => {
      await storage.flushStorage({
        config: {},
        query: 'bar',
      });
      storage.getStorageState().query.should.equal('bar');
    });
    it('should return prev state if flush throws', async () => {
      jest
        .spyOn(storage, 'flushStorage')
        .mockRejectedValueOnce(
          'Device is running low on available storage space',
        );
      await storage
        .flushStorage({
          query: 'bar',
        })
        .catch(() => {
          storage.getStorageState().query.should.equal(queryMock);
        });
    });
    it('should remove empty values from storage on flush', async () => {
      await storage.flushStoragePart({
        config: {},
        query: 'bar',
      });
      expect(MockedStorage.multiRemove).toHaveBeenLastCalledWith([
        'YT_dismissActivityActionAccessTouch',
        'YT_mergedNotifications',
        'YT_HANDSET_MODE',
        'YT_notificationsSwipe',
        'YT_ARTICLES',
        'YT_ARTICLES_LIST',
        'YT_ARTICLES_QUERY',
        'YT_ARTICLE_LAST_VISITED',
        'yt_mobile_auth',
        'YT_DEFAULT_CREATE_PROJECT_ID_STORAGE',
        'YT_PROJECTS_STORAGE',
        'DRAFT_ID_STORAGE_KEY',
        'YT_CURRENT_USER_STORAGE_KEY',
        'YT_CREATION_TIMESTAMP_STORAGE_KEY',
        'YT_SEARCH_CONTEXT_STORAGE',
        'YT_LAST_QUERIES_STORAGE_KEY',
        'yt_mobile_issues_cache',
        'YT_INBOX_CACHE',
        'YT_INBOX_THREADS_CACHE',
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
        'YT_VCS_CHANGES',
        'YT_ISSUES_SETTINGS',
      ]);
    });
    it('should update field state on partial flush', async () => {
      await storage.flushStorage({
        config: {},
        query: 'bar',
      });
      await storage.flushStoragePart({
        query: 'foo',
      });
      MockedStorage.multiSet.should.have.been.called;
      storage.getStorageState().query.should.equal('foo');
    });
    it('should update boolean field state on partial flush', async () => {
      await storage.flushStoragePart({
        agileZoomedIn: true,
      });
      storage.getStorageState().agileZoomedIn.should.equal(true);
    });
  });
  describe('Auth parameters', () => {
    let authParamsMock;
    let authParamsKeyMock;
    beforeEach(async () => {
      authParamsMock = {
        token: 'token',
      };
      authParamsKeyMock = '0123';
      jest.spyOn(EncryptedStorage, 'setItem');
      jest.spyOn(EncryptedStorage, 'getItem');
      await storage.__setStorageState({
        authParams: authParamsMock,
        authParamsKey: authParamsKeyMock,
      });
    });
    describe('Secure accounts', () => {
      it('should secure current account', async () => {
        jest.spyOn(MockedStorage, 'multiGet').mockResolvedValueOnce([
          ['YT_CREATION_TIMESTAMP_STORAGE_KEY', '1234567890'],
          ['yt_mobile_auth', '{}'],
        ]);
        await storage.populateStorage();
        expect(storage.getStorageState().authParams).toEqual(undefined);
      });
    });
    describe('storeAuthParams', () => {
      it('should cache encrypted auth params', async () => {
        const cachedAuthParams = await storageHelper.storeSecurelyAuthParams(
          authParamsMock,
          authParamsKeyMock,
        );
        await expect(EncryptedStorage.setItem).toHaveBeenCalledWith(
          authParamsKeyMock,
          JSON.stringify(authParamsMock),
        );
        await expect(cachedAuthParams).toEqual(authParamsMock);
      });
    });
    describe('getStoredAuthParams', () => {
      it('should return cached auth params object', async () => {
        EncryptedStorage.getItem.mockResolvedValueOnce(
          JSON.stringify(authParamsMock),
        );
        const cachedParams = await storageHelper.getStoredSecurelyAuthParams(
          authParamsKeyMock,
        );
        await expect(EncryptedStorage.getItem).toHaveBeenCalledWith(
          authParamsKeyMock,
        );
        await expect(cachedParams).toEqual(authParamsMock);
      });
      it('should return NULL if no data cached', async () => {
        EncryptedStorage.setItem.mockResolvedValueOnce(undefined);
        const cachedParams = await storageHelper.getStoredSecurelyAuthParams(
          authParamsKeyMock,
        );
        await expect(EncryptedStorage.getItem).toHaveBeenCalledWith(
          authParamsKeyMock,
        );
        await expect(cachedParams).toEqual(null);
      });
    });
  });
});
