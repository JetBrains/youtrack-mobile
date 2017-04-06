import {loadConfig, getStoredConfig, formatYouTrackURL} from './config';
import sinon from 'sinon';
import {AsyncStorage} from 'react-native';

describe('Config', () => {
  describe('Loading', () => {
    let fetch;
    let response;
    let responseJson;

    beforeEach(() => {
      responseJson = {
        ring: {
          url: 'http://hub.com',
          serviceId: 'fake-service-id'
        },
        mobile: {
          serviceId: 'fake-mobile-id',
          serviceSecret: 'fake-service-secret'
        },
        statisticsEnabled: true,
        version: '7.0'
      };
      response = {
        status: 200,
        json: () => Promise.resolve(responseJson)
      };

      fetch = global.fetch = sinon.stub();

      fetch.returns(Promise.resolve(response));
    });

    it('should load config from server', async() => {
      const res = await loadConfig('http://fake.backend');

      res.should.deep.equal({
        auth: {
          clientId: 'fake-mobile-id',
          clientSecret: 'fake-service-secret',
          landingUrl: 'ytoauth://landing.url',
          scopes: 'Hub YouTrack',
          serverUri: 'http://hub.com',
          youtrackServiceId: 'fake-service-id'
        },
        backendUrl: 'http://fake.backend',
        statisticsEnabled: true,
        version: '7.0'
      });
    });

    it('should correctly construct hub url for embedded hub on standalone', async() => {
      responseJson.ring.url = '/hub';
      const res = await loadConfig('http://fake.backend');
      res.auth.serverUri.should.equal('http://fake.backend/hub');
    });

    it('should correctly construct hub url for embedded hub on cloud', async() => {
      responseJson.ring.url = '/hub';
      const res = await loadConfig('https://foo.myjetbrains.com/youtrack');
      res.auth.serverUri.should.equal('https://foo.myjetbrains.com/hub');
    });

    it('should go for config to correct URL', async() => {
      await loadConfig('http://fake.backend');
      fetch.should.have.been.calledWith('http://fake.backend/api/config?fields=ring(url,serviceId),mobile(serviceSecret,serviceId),version,statisticsEnabled', {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*'
        }
      });
    });

    it('should not add fields to URL if it is version detect fallback URL', async() => {
      await loadConfig('http://fake.backend/rest/workflow/version');
      fetch.should.have.been.calledWith('http://fake.backend/rest/workflow/version', sinon.match.object);
    });

    it('should throw IncompatibleYouTrackError if old youtrack entered', (done) => {
      responseJson.version = '6.5';
      loadConfig('http://fake.backend')
        .catch(err => {
          err.message.should.contain('YouTrack Mobile requires YouTrack version 7.0 or later');
          done();
        });
    });

    it('should throw IncompatibleYouTrackError if mobile service does not exist', (done) => {
      responseJson = {error_developer_message: 'Foo foo'};
      loadConfig('http://fake.backend')
        .catch(err => {
          err.message.should.contain('Unable to connect to this YouTrack');
          err.message.should.contain('Foo foo');
          done();
        });
    });

    it('should throw IncompatibleYouTrackError if broken YouTrack', (done) => {
      responseJson = {foo: 'bar'};
      loadConfig('http://fake.backend')
        .catch(err => {
          err.message.should.contain('The mobile application feature is not enabled');
          done();
        });
    });
  });

  describe('Loading stored config', () => {
    const BACKEND_CONFIG_STORAGE_KEY = 'BACKEND_CONFIG_STORAGE_KEY';
    const configMock = {foo: 'bar'};

    beforeEach(() => {
      AsyncStorage.removeItem(BACKEND_CONFIG_STORAGE_KEY);
    });

    it('should load config from local storage', async() => {
      AsyncStorage.setItem(BACKEND_CONFIG_STORAGE_KEY, JSON.stringify(configMock));

      const config = await getStoredConfig();
      config.should.deep.equal(configMock);
    });

    it('should return nothing if no stored config found', async() => {
      const config = await getStoredConfig();
      expect(config).toBeNull();
    });
  });

  describe('YouTrack URL formatting', () => {
    it('should drop http protocol', () => {
      formatYouTrackURL('http://foo.com').should.equal('foo.com');
    });

    it('should drop http protocol for oneword url', () => {
      formatYouTrackURL('http://foo').should.equal('foo');
    });

    it('should drop http protocol for complex url', () => {
      formatYouTrackURL('http://foo.com:8080/bar').should.equal('foo.com:8080/bar');
    });

    it('should drop https protocol', () => {
      formatYouTrackURL('https://foo.com').should.equal('foo.com');
    });

    it('should drop /youtrack context', () => {
      formatYouTrackURL('foo.com/youtrack').should.equal('foo.com');
    });

    it('should drop both protocol and /youtrack context', () => {
      formatYouTrackURL('http://foo.com/youtrack').should.equal('foo.com');
    });
  });
});
