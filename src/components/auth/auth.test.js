import EncryptedStorage from 'react-native-encrypted-storage';

import Auth from './auth';
import sinon from 'sinon';

import * as storageHelper from '../storage/storage__oauth';
import {__setStorageState} from '../storage/storage';

let configMock;
let authParamsMock;
let authParamsMockKey;
let requests;
let clock;
let auth;

describe('Auth', function () {

  describe('General', () => {
    const getLastRequest = () => requests[requests.length - 1];
    const mockConfigLoading = auth => sinon.stub(auth, 'getCachedAuthParams').returns(Promise.resolve(authParamsMock));
    const mockConfigSaving = auth => sinon.stub(auth, 'cacheAuthParams', (authParams) => authParams);

    beforeEach(() => {
      jest.restoreAllMocks();
    });

    beforeEach(() => {
      requests = [];
      clock = sinon.useFakeTimers();
      configMock = createConfigMock();
      authParamsMock = createAuthParamsMock();
      authParamsMockKey = '0123';

      global.fetch = sinon.spy(function (url, options) {
        return new Promise(function (resolve, reject) {
          const request = {
            url: url,
            options: options,
            requestBody: options.body,
            resolve: resolve,
            reject: reject,
          };
          global.fetch.onRequest(request);
          requests.push(request);
        });
      });

      global.fetch.onRequest = () => {};

      __setStorageState({authParamsKey: authParamsMockKey});
    });

    afterEach(function () {
      delete global.fetch;
      clock.restore();
    });

    it('should be imported', () => Auth.should.be.defined);

    it('should create OAuth instance', () => {
      auth = createAuthMock();
      auth.should.be.defined;
    });

    describe('working with auth instance', () => {
      beforeEach(() => {
        auth = createAuthMock();
        mockConfigLoading(auth);
        mockConfigSaving(auth);
      });

      it('should try to load current user to verify token', () => {
        auth.loadCurrentUser(authParamsMock);

        getLastRequest().url.should.contain('api/rest/users/me?fields=');
      });

      it('should provide authorization params when trying to verify token', () => {
        auth.loadCurrentUser(authParamsMock);

        getLastRequest().options.headers.Authorization.should
          .equal(`${authParamsMock.token_type} ${authParamsMock.access_token}`);
      });

      it('should complete verification successfully if hub responded', () => {
        const promise = auth.loadCurrentUser(authParamsMock);

        getLastRequest().resolve({
          status: 200,
          json: () => ({
            id: 'fake-user',
          }),
        });

        return promise.should.be.fulfilled;
      });

      it('should fail verification if hub responded with error', () => {
        const promise = auth.loadCurrentUser(authParamsMock);

        getLastRequest().resolve({status: 403});

        return promise.should.be.rejected;
      });

      it('should perform token refresh if it`s expired', () => {
        sinon.stub(auth, 'getRefreshToken').returns('token');
        sinon.stub(auth, 'refreshToken').returns(Promise.resolve({}));
        const promise = auth.loadCurrentUser(authParamsMock);

        getLastRequest().resolve({status: 401});

        return promise.should.be.fulfilled;
      });

      it('should refresh token', async () => {

        const response = {access_token: 'new-token', refresh_token: 'new-refresh'};

        global.fetch.onRequest = options => {
          if (options.url.includes('/api/rest/oauth2/token')) {
            return options.resolve({status: 200, json: () => (response)});
          }
          options.resolve({status: 200, json: () => ({})});
        };

        const authParams = await auth.refreshToken();

        authParams.should.deep.equal(response);
        auth.authParams.should.equal(authParams);
      });

      it('should fail refresh if permission management service is unavailable', () => {
        const response = {error_code: 500};
        const promise = auth.refreshToken();

        global.fetch.onRequest = options => {
          if (options.url.includes('/api/rest/oauth2/token')) {
            return options.resolve({status: 200, json: () => (response)});
          }
          options.resolve({status: 200, json: () => ({})});
        };

        return promise.should.be.rejected;
      });

      it('should authorize via login/password', () => {
        Auth.obtainTokenByCredentials('log', 'pass', configMock);

        const request = getLastRequest();

        request.url.should.equal(`${configMock.auth.serverUri}/api/rest/oauth2/token`);
        request.requestBody.should.equal('grant_type=password&access_type=offline&username=log&password=pass&scope=scope1%20scope2');
        request.options.headers.Authorization.should.equal('Basic Y2xpZW50LWlkOmNsaWVudC1zZWNyZXQ=');
        request.options.headers['Content-Type'].should.equal('application/x-www-form-urlencoded');
      });

      it('should encode params when authorizing via login/password', () => {
        Auth.obtainTokenByCredentials('lo$g', 'pa%ss', configMock);

        const request = getLastRequest();
        request.requestBody.should.equal('grant_type=password&access_type=offline&username=lo%24g&password=pa%25ss&scope=scope1%20scope2');
      });

      it('should authorize OAuth2 code', () => {
        const oauthCodeMock = 'fake-code';
        Auth.obtainTokenByOAuthCode(oauthCodeMock, configMock);

        const request = getLastRequest();

        request.options.method.should.equal('POST');
        request.url.should.equal(`${configMock.auth.serverUri}/api/rest/oauth2/token`);
        request.options.headers.Authorization.should.equal('Basic Y2xpZW50LWlkOmNsaWVudC1zZWNyZXQ=');
        request.requestBody.should.equal(`grant_type=authorization_code&code=${oauthCodeMock}&client_id=client-id&client_secret=client-secret&redirect_uri=ytoauth://landing.url`);
      });
    });

  });


  describe('Get/Save cached auth parameters', () => {
    afterEach(() => jest.clearAllMocks());

    beforeEach(() => {
      authParamsMock = createAuthParamsMock();
      auth = createAuthMock(createConfigMock());
    });

    describe('cacheAuthParams', () => {
      it('should cache encrypted auth params', async () => {
      jest.spyOn(storageHelper, 'storeSecurelyAuthParams');
        const cachedAuthParams = await auth.cacheAuthParams(authParamsMock, authParamsMockKey);

        await expect(storageHelper.storeSecurelyAuthParams).toHaveBeenCalledWith(
          authParamsMock,
          authParamsMockKey
          );
        await expect(cachedAuthParams).toEqual(authParamsMock);
      });

      it('should cache encrypted auth params with particular key', async () => {
      jest.spyOn(storageHelper, 'storeSecurelyAuthParams');
        const keyMock = 'datestamp';
        const cachedAuthParams = await auth.cacheAuthParams(authParamsMock, keyMock);

        await expect(storageHelper.storeSecurelyAuthParams).toHaveBeenCalledWith(
          authParamsMock,
          keyMock
          );
        await expect(cachedAuthParams).toEqual(authParamsMock);
      });
    });


    describe('getCachedAuthParams', () => {
      beforeEach(() => {
        jest.spyOn(storageHelper, 'getStoredSecurelyAuthParams');
      });

      it('should throw if there is no cached auth parameters', async () => {
        await expect(auth.getCachedAuthParams())
          .rejects
          .toThrow('No stored auth params found');
      });

      it('should get auth parameters', async () => {
        jest.spyOn(EncryptedStorage, 'getItem').mockResolvedValueOnce(JSON.stringify(authParamsMock));
        const cachedAuthParams = await auth.getCachedAuthParams();

        await expect(storageHelper.getStoredSecurelyAuthParams).toHaveBeenCalled();
        await expect(cachedAuthParams).toEqual(authParamsMock);
      });
    });
  });

});


function createConfigMock() {
  return {
    backendUrl: 'http://youtrack.example',
    auth: {
      serverUri: 'http://youtrack/pm.example',
      clientId: 'client-id',
      clientSecret: 'client-secret',
      youtrackServiceId: 'yt-service-id',
      scopes: 'scope1 scope2',
      landingUrl: 'ytoauth://landing.url',
    },
  };
}

function createAuthParamsMock() {
  return {
    access_token: 'fake-access-token',
    refresh_token: 'fake-refresh-token',
    token_type: 'bearer',
  };
}

function createAuthMock(config) {
  return new Auth(config || configMock);
}
