import {formatYouTrackURL, loadConfig} from './config';
import {YT_SUPPORTED_VERSION} from 'components/error-message/error-text-messages';
import {__setStorageState} from '../storage/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const serverUrlMock = 'http://fake.backend';

describe('Config', () => {
  describe('Loading', () => {
    let response;
    let responseJson;
    beforeEach(() => {
      __setStorageState({
        config: null,
      });

      responseJson = {
        ring: {
          url: 'http://hub.com',
          serviceId: 'fake-service-id',
        },
        mobile: {
          serviceId: 'fake-mobile-id',
          serviceSecret: 'fake-service-secret',
        },
        statisticsEnabled: true,
        version: '7.0',
        l10n: {
          language: 'de',
          locale: 'de-DE',
        },
      };
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
      res.should.deep.equal({
        auth: {
          clientId: 'fake-mobile-id',
          clientSecret: 'fake-service-secret',
          landingUrl: 'ytoauth://landing.url',
          scopes: 'Hub YouTrack',
          serverUri: 'http://hub.com',
          youtrackServiceId: 'fake-service-id',
        },
        backendUrl: serverUrlMock,
        statisticsEnabled: responseJson.statisticsEnabled,
        version: responseJson.version,
        l10n: responseJson.l10n,
      });
    });
    it('should correctly construct hub url for embedded hub on standalone', async () => {
      responseJson.ring.url = '/hub';
      const res = await loadConfig(serverUrlMock);
      res.auth.serverUri.should.equal(`${serverUrlMock}/hub`);
    });
    it('should correctly construct hub url for embedded hub on cloud', async () => {
      responseJson.ring.url = '/hub';
      const res = await loadConfig('https://foo.myjetbrains.com/youtrack');
      res.auth.serverUri.should.equal('https://foo.myjetbrains.com/hub');
    });

    it('should go for config to correct URL', async () => {
      await loadConfig(serverUrlMock);
      expect(fetch).toHaveBeenCalledWith(
        'http://fake.backend/api/config?fields=ring(url,serviceId),mobile(serviceSecret,serviceId),version,build,statisticsEnabled,l10n(language,locale,predefinedQueries)',
        {
          method: 'GET',
          headers: {
            Accept: 'application/json, text/plain, */*',
            'User-Agent': 'YouTrackMobile/0.1 (unknown unknown unknown)',
          },
        },
      );
    });

    it('should throw IncompatibleYouTrackError if old YouTrack entered', async () => {
      responseJson.version = '6.5';

      await expect(
        () => loadConfig(serverUrlMock)
      ).rejects.toEqual(
        Error(`${YT_SUPPORTED_VERSION} ${serverUrlMock} has version ${responseJson.version}.`)
      );
    });

    it('should throw IncompatibleYouTrackError if mobile service does not exist', async () => {
      responseJson = {
        error_developer_message: 'Foo foo',
      };

      await expect(
        () => loadConfig(serverUrlMock)
      ).rejects.toEqual(
        Error(`Unable to connect to this YouTrack instance. ${YT_SUPPORTED_VERSION} ${responseJson.error_developer_message}`)
      );
    });
    it('should throw IncompatibleYouTrackError if broken YouTrack', async () => {
      responseJson = {
        foo: 'bar',
      };
      await expect(
        () => loadConfig(serverUrlMock)
      ).rejects.toEqual(Error(`The mobile application feature is not enabled for ${serverUrlMock}. Please contact support.`));
    });
  });


  describe('YouTrack URL formatting', () => {
    it('should drop http protocol', () => {
      expect(formatYouTrackURL('http://foo.com')).toEqual('foo.com');
    });

    it('should drop http protocol for oneword url', () => {
      expect(formatYouTrackURL('http://foo')).toEqual('foo');
    });

    it('should drop http protocol for complex url', () => {
      expect(formatYouTrackURL('http://foo.com:8080/bar')).toEqual(
        'foo.com:8080/bar',
      );
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
