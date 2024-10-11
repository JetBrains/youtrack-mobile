import AsyncStorage from '@react-native-async-storage/async-storage';

import {__setStorageState} from 'components/storage/storage';
import {formatYouTrackURL, loadConfig} from './config';
import {YT_SUPPORTED_VERSION} from 'components/error-message/error-text-messages';

import type {AppConfig} from 'types/AppConfig';
import {CustomError} from 'types/Error.ts';

const serverUrlMock = 'http://example.com';

describe('Config', () => {
  describe('Loading', () => {
    let response;
    let responseJson: AppConfig;

    beforeEach(() => {
      jest.restoreAllMocks();
      __setStorageState({
        config: null,
      });

      responseJson = {
        ring: {
          url: 'http://server.url',
          serviceId: 'service-id',
        },
        mobile: {
          serviceId: 'mobile-id',
          serviceSecret: 'service-secret',
        },
        statisticsEnabled: true,
        version: '7.0',
        l10n: {
          language: 'de',
          locale: 'de-DE',
          predefinedQueries: {me: 'me'},
        },
      } as unknown as AppConfig;
      response = {
        status: 200,
        json: () => Promise.resolve(responseJson),
      };
      global.fetch = jest.fn().mockResolvedValue(response);
      jest.spyOn(AsyncStorage, 'multiSet');
    });

    afterEach(() => jest.restoreAllMocks());

    it('should load config from server', async () => {
      const res = await loadConfig(serverUrlMock);

      expect(res).toEqual({
        ...responseJson,
        auth: {
          clientId: 'mobile-id',
          clientSecret: 'service-secret',
          landingUrl: 'ytoauth://landing.url',
          scopes: 'Hub YouTrack Konnektor',
          serverUri: 'http://server.url',
          youtrackServiceId: 'service-id',
        },
      });
    });

    it('should correctly construct hub url for embedded hub on standalone', async () => {
      responseJson.ring.url = '/hub';
      const res = await loadConfig(serverUrlMock);

      expect(res.auth.serverUri).toEqual(`${serverUrlMock}/hub`);
    });

    it('should correctly construct hub url for embedded hub on cloud', async () => {
      responseJson.ring.url = '/hub';
      const res = await loadConfig('https://foo.myjetbrains.com/youtrack');

      expect(res.auth.serverUri).toEqual('https://foo.myjetbrains.com/hub');
    });

    it('should go for config to correct URL', async () => {
      await loadConfig(serverUrlMock);
      expect(fetch).toHaveBeenCalledWith(
        `${serverUrlMock}/api/config?fields=ring(url,serviceId),mobile(serviceSecret,serviceId),version,build,statisticsEnabled,l10n(language,locale,predefinedQueries)`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json, text/plain, */*',
            'User-Agent': 'YouTrackMobile/0.1 (unknown unknown unknown)',
          },
        }
      );
    });

    it('should throw IncompatibleYouTrackError if old YouTrack entered', async () => {
      responseJson.version = '6.5';

      await expect(() => loadConfig(serverUrlMock)).rejects.toEqual(Error(YT_SUPPORTED_VERSION));
    });

    it('should throw IncompatibleYouTrackError if mobile service does not exist', async () => {
      responseJson = {error_developer_message: 'Foo foo'} as unknown as AppConfig;

      await expect(() => loadConfig(serverUrlMock)).rejects.toEqual(
        Error(
          `Unable to connect to this YouTrack instance. ${YT_SUPPORTED_VERSION} ${
            (responseJson as unknown as CustomError).error_developer_message
          }`
        )
      );
    });
    it('should throw IncompatibleYouTrackError if broken YouTrack', async () => {
      responseJson = {foo: 'bar', version: '2017'} as unknown as AppConfig;
      await expect(() => loadConfig(serverUrlMock)).rejects.toEqual(
        Error(`The mobile application feature is not enabled for ${serverUrlMock}. Please contact support.`)
      );
    });
  });

  describe('YouTrack URL formatting', () => {
    it('should drop http protocol', () => {
      expect(formatYouTrackURL('http://foo.com')).toEqual('foo.com');
    });

    it('should drop http protocol for one word url', () => {
      expect(formatYouTrackURL('http://foo')).toEqual('foo');
    });

    it('should drop http protocol for complex url', () => {
      expect(formatYouTrackURL('http://foo.com:8080/bar')).toEqual('foo.com:8080/bar');
    });

    it('should drop https protocol', () => {
      expect(formatYouTrackURL('https://foo.com')).toEqual('foo.com');
    });

    it('should drop /youtrack context', () => {
      expect(formatYouTrackURL('foo.com/youtrack')).toEqual('foo.com');
    });

    it('should drop both protocol and /youtrack context', () => {
      expect(formatYouTrackURL('http://foo.com/youtrack')).toEqual('foo.com');
    });
  });
});
