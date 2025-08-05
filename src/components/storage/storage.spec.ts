import * as storage from './storage';
import * as storageHelper from './storage__oauth';
import EncryptedStorage from 'react-native-encrypted-storage';
import MockedStorage from '@react-native-async-storage/async-storage';

import {StorageState, storageStateAuthParamsKey} from './storage';
import {AuthParams} from 'types/Auth';

let queryMock: string;
let configMock: object;

describe('Storage', () => {
  beforeEach(() => jest.restoreAllMocks());

  describe('Change storage', () => {
    beforeEach(async () => {
      queryMock = 'for: me';
      configMock = {
        foo: 'bar',
      };
      jest.spyOn(MockedStorage, 'multiSet');
      jest.spyOn(MockedStorage, 'multiRemove');
      jest.spyOn(MockedStorage, 'multiGet').mockResolvedValue([
        ['BACKEND_CONFIG_STORAGE_KEY', '{"foo": "bar"}'],
        ['YT_QUERY_STORAGE', queryMock],
        ['yt_mobile_auth_key', '123'],
      ]);
      await storage.populateStorage();
    });

    it('should populate storage', async () => {
      expect(storage.getStorageState().config).toEqual(configMock);
      expect(storage.getStorageState().query).toEqual(queryMock);
    });

    it('should update state on full flush', async () => {
      await storage.flushStorage({config: {}, query: 'bar'} as StorageState);
      expect(storage.getStorageState().query).toEqual('bar');
    });

    it('should return prev state if flush throws', async () => {
      jest.spyOn(storage, 'flushStorage').mockRejectedValueOnce('Device is running low on available storage space');
      try {
        await storage.flushStorage({query: 'bar'} as StorageState);
      } catch {}

      expect(storage.getStorageState().query).toEqual(queryMock);
    });

    it('should remove empty values from storage on flush', async () => {
      await storage.flushStoragePart({
        config: {},
        query: 'bar',
      });

      expect(MockedStorage.multiRemove).toHaveBeenLastCalledWith([
        'YT_dismissActivityActionAccessTouch',
        'YT_dismissNotificationSwipe',
        'YT_mergedNotifications',
        'YT_HANDSET_MODE',
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
        'YT__HELPDESK_QUERY_STORAGE',
        'YT_SEARCH_CONTEXT_STORAGE',
        'YT_HELPDESK_SEARCH_CONTEXT_STORAGE',
        'YT_LAST_QUERIES_STORAGE_KEY',
        'yt_mobile_issues_cache',
        'yt_mobile_helpdesk_cache',
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
        'YT_HELPDESK_SETTINGS',
        'YT_MOBILE_HD_MENU_HIDDEN',
      ]);
    });

    it('should update field state on partial flush', async () => {
      await storage.flushStorage({
        config: {},
        query: 'bar',
      }  as StorageState);
      await storage.flushStoragePart({
        query: 'foo',
      });

      expect(MockedStorage.multiSet).toHaveBeenCalled();
      expect(storage.getStorageState().query).toEqual('foo');
    });

    it('should update boolean field state on partial flush', async () => {
      await storage.flushStoragePart({
        agileZoomedIn: true,
      });

      expect(storage.getStorageState().agileZoomedIn).toEqual(true);
    });
  });

  describe('Auth parameters', () => {
    let authParamsMock: AuthParams;
    let authParamsKeyMock: string;

    beforeEach(async () => {
      authParamsMock = {access_token: 'token'} as AuthParams;
      authParamsKeyMock = '0123';
      jest.spyOn(EncryptedStorage, 'setItem');
      jest.spyOn(EncryptedStorage, 'getItem');
      await storage.__setStorageState({
        authParams: authParamsMock,
        [storageStateAuthParamsKey]: authParamsKeyMock,
      } as Partial<StorageState>);
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
        const cachedAuthParams = await storageHelper.storeSecurelyAuthParams(authParamsMock, authParamsKeyMock);

        expect(EncryptedStorage.setItem).toHaveBeenCalledWith(authParamsKeyMock, JSON.stringify(authParamsMock));
        expect(cachedAuthParams).toEqual(authParamsMock);
      });
    });

    describe('getStoredAuthParams', () => {
      it('should return cached auth params object', async () => {
        (EncryptedStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(authParamsMock));
        const cachedParams = await storageHelper.getStoredSecurelyAuthParams(authParamsKeyMock);

        expect(EncryptedStorage.getItem).toHaveBeenCalledWith(authParamsKeyMock);
        expect(cachedParams).toEqual(authParamsMock);
      });

      it('should return NULL if no data cached', async () => {
        (EncryptedStorage.setItem as jest.Mock).mockResolvedValueOnce(undefined);
        const cachedParams = await storageHelper.getStoredSecurelyAuthParams(authParamsKeyMock);

        expect(EncryptedStorage.getItem).toHaveBeenCalledWith(authParamsKeyMock);
        expect(cachedParams).toEqual(null);
      });
    });
  });
});
