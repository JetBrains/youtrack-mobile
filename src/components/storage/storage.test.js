import MockedStorage from '@react-native-community/async-storage';
import sinon from 'sinon';

import * as storage from './storage';
import EncryptedStorage from 'react-native-encrypted-storage';
import {cacheAuthParams, getCachedAuthParams, STORAGE_AUTH_PARAMS_KEY} from './storage';

let queryMock;
let sandbox;
let configMock;

describe('Storage', () => {
  beforeEach(() => jest.restoreAllMocks());

  describe('Change storage', () => {
    beforeEach(async () => {
      queryMock = 'for: me';
      configMock = {foo: 'bar'};

      sandbox = sinon.sandbox.create();
      sandbox.spy(MockedStorage, 'multiSet');
      sandbox.spy(MockedStorage, 'multiRemove');
      sandbox.stub(MockedStorage, 'multiGet').returns(Promise.resolve([
        ['BACKEND_CONFIG_STORAGE_KEY', '{"foo": "bar"}'],
        ['YT_QUERY_STORAGE', queryMock],
      ]));

      await storage.populateStorage();
    });

    afterEach(() => sandbox.restore());

    it('should populate storage', async () => {
      storage.getStorageState().config.should.deep.equal(configMock);
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

      expect(MockedStorage.multiRemove).toHaveBeenLastCalledWith([
        'YT_ARTICLES',
        'YT_ARTICLES_LIST',
        'YT_ARTICLES_QUERY',
        'YT_ARTICLE_LAST_VISITED',
        'YT_DEFAULT_CREATE_PROJECT_ID_STORAGE',
        'YT_PROJECTS_STORAGE',
        'DRAFT_ID_STORAGE_KEY',
        'YT_CURRENT_USER_STORAGE_KEY',
        'YT_CREATION_TIMESTAMP_STORAGE_KEY',
        'YT_SEARCH_CONTEXT_STORAGE',
        'YT_LAST_QUERIES_STORAGE_KEY',
        'yt_mobile_issues_cache',
        'YT_INBOX_CACHE',
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

  describe('Get/Save cached auth parameters', () => {
    let authParamsMock;
    beforeEach(() => {
      authParamsMock = {token: 'token'};
      jest.spyOn(EncryptedStorage, 'setItem');
      jest.spyOn(EncryptedStorage, 'getItem');
    });

    describe('cacheAuthParams', () => {
      it('should cache encrypted auth params', async () => {
        const cachedAuthParams = await cacheAuthParams(authParamsMock);

        await expect(EncryptedStorage.setItem).toHaveBeenCalledWith(
          STORAGE_AUTH_PARAMS_KEY,
          JSON.stringify(authParamsMock)
        );
        await expect(cachedAuthParams).toEqual(authParamsMock);
      });
    });


    describe('getCachedAuthParams', () => {
      it('should return cached auth params object', async () => {
        EncryptedStorage.getItem.mockResolvedValueOnce(JSON.stringify(authParamsMock));
        const cachedParams = await getCachedAuthParams();

        await expect(EncryptedStorage.getItem).toHaveBeenCalledWith(STORAGE_AUTH_PARAMS_KEY);
        await expect(cachedParams).toEqual(authParamsMock);
      });

      it('should return NULL if no data cached', async () => {
        EncryptedStorage.setItem.mockResolvedValueOnce(undefined);
        const cachedParams = await getCachedAuthParams();

        await expect(EncryptedStorage.getItem).toHaveBeenCalledWith(STORAGE_AUTH_PARAMS_KEY);
        await expect(cachedParams).toEqual(null);
      });
    });
  });
});
