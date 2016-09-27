import Auth from './auth';
import sinon from 'sinon';

describe('Auth', function () {
  let fakeConfig;
  let fakeAuthParams;
  let requests;

  const getLastRequest = () => requests[requests.length - 1];

  const mockConfigLoading = auth => sinon.stub(auth, 'readAuth').returns(fakeAuthParams);
  const mockConfigSaving = auth => sinon.stub(auth, 'storeAuth').returns(fakeAuthParams);

  beforeEach(() => {
    requests = [];

    fakeConfig = {
      backendUrl: 'http://fake-backend-url.ru',
      auth: {
        serverUri: 'http://fake-hub.ru',
        clientId: 'client-id',
        clientSecret: 'client-secret',
        youtrackServiceId: 'yt-service-id',
        scopes: 'scope1 scope2',
        landingUrl: 'ytoauth://landing.url'
      }
    };

    fakeAuthParams = {
      access_token: 'fake-access-token',
      refresh_token: 'fake-refresh-token',
      token_type: 'bearer'
    };

    global.fetch = sinon.spy(function(url, options) {
      return new Promise(function(resolve, reject) {
        requests.push({
          url: url,
          options: options,
          requestBody: options.body,
          resolve: resolve,
          reject: reject
        });
      });
    });
  });

  afterEach(function () {
    delete global.fetch;
  });

  it('should be imported', () => Auth.should.be.defined);

  it('should create instance', () => {
    const auth = new Auth(fakeConfig);
    auth.should.be.defined;
  });

  describe('working with auth instance', () => {
    let auth;

    beforeEach(() => {
      auth = new Auth(fakeConfig);
      mockConfigLoading(auth);
      mockConfigSaving(auth);
    });

    it('should try to load current user to verify token', () => {
      auth.verifyToken(fakeAuthParams);

      getLastRequest().url.should.contain('api/rest/users/me?fields=');
    });

    it('should pass authorization when trying to verify token', () => {
      auth.verifyToken(fakeAuthParams);

      getLastRequest().options.headers.Authorization.should
        .equal(`${fakeAuthParams.token_type} ${fakeAuthParams.access_token}`);
    });

    it('should complete verification successfully if hub responded', () => {
      const promise = auth.verifyToken(fakeAuthParams);

      getLastRequest().resolve({
        status: 200,
        json: () => ({
          id: 'fake-user'
        })
      });

      return promise;
    });

    it('should fail verification if hub responded with error', () => {
      const promise = auth.verifyToken(fakeAuthParams);

      getLastRequest().resolve({status: 403});

      return promise.should.be.rejected;
    });

    it('should refresh token if was expired', () => {
      const promise = auth.verifyToken(fakeAuthParams);
      sinon.stub(auth, 'refreshToken').returns(Promise.resolve({}));

      getLastRequest().resolve({status: 401});

      return promise.should.be.fulfilled;
    });
  });
});
