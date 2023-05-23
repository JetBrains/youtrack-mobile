import EncryptedStorage from 'react-native-encrypted-storage';
import {enableFetchMocks} from 'jest-fetch-mock';

import mocks from 'test/mocks';
import * as storageHelper from '../storage/storage__oauth';
import Auth from './oauth2';
import {__setStorageState} from '../storage/storage';
import {ERROR_MESSAGE_DATA} from '../error/error-message-data';
import OAuth2 from './oauth2';
import {AppConfig} from 'types/AppConfig';
import {AuthParams} from 'types/Auth';
import {CustomError} from 'types/Error';

jest.mock('react-native-app-auth');
enableFetchMocks();
let configMock: AppConfig;
let authParamsMock: AuthParams;
let authParamsMockKey: string;
let auth: OAuth2;


describe('OAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    fetch.resetMocks();
  });
  beforeEach(() => {
    configMock = mocks.createConfigMock();
    authParamsMock = mocks.createAuthParamsMock();
    authParamsMockKey = '0123';

    __setStorageState({
      authParamsKey: authParamsMockKey,
    });

    auth = createAuthMock();
  });
  it('should exists', () => {
    expect(Auth).toBeDefined();
  });
  it('should create OAuth instance', () => {
    expect(auth).toBeDefined();
  });


  describe('loadCurrentUser', () => {
    let errorMock: CustomError;
    beforeEach(() => {
      errorMock = (new Error('Invalid')) as CustomError;
      jest.spyOn(auth, 'getRefreshToken');
      jest.spyOn(auth, 'refreshToken').mockImplementationOnce(() => null);
    });
    it('should throw if request responded with an error', async () => {
      mockResponse(null, errorMock);
      await expect(auth.loadCurrentUser(authParamsMock)).rejects.toThrow(
        errorMock,
      );
    });

    it('should throw if the current user is banned', async () => {
      mockResponse({
        banned: true,
      });
      await expect(auth.loadCurrentUser(authParamsMock)).rejects.toThrow(
        new Error(ERROR_MESSAGE_DATA.USER_BANNED.title),
      );
    });

    it('should not refresh a token if user has no required permissions', async () => {
      errorMock.status = 403;
      auth.getRefreshToken.mockReturnValueOnce('prevToken');
      mockResponse(null, errorMock);
      await expect(auth.loadCurrentUser(authParamsMock)).rejects.toThrow();
      expect(auth.refreshToken).not.toHaveBeenCalled();
    });

    it('should refresh a token if a token is out of date', async () => {
      errorMock.status = 401;
      auth.getRefreshToken.mockReturnValueOnce('prevToken');
      mockResponse(null, errorMock);
      await auth.loadCurrentUser(authParamsMock);
      expect(auth.refreshToken).toHaveBeenCalled();
    });

    it('should not refresh a token if there is no auth params in a cache', async () => {
      errorMock.status = 401;
      auth.getRefreshToken.mockReturnValueOnce('');
      mockResponse(null, errorMock);
      await expect(auth.loadCurrentUser(authParamsMock)).rejects.toThrow();
      expect(auth.refreshToken).not.toHaveBeenCalled();
    });

    it('should set the current user', async () => {
      const userMock = {
        id: 'currentUser',
      };
      mockResponse(userMock);
      await auth.loadCurrentUser(authParamsMock);
      expect(auth.currentUser).toEqual(userMock);
    });

    function mockResponse(resolveData: any, rejectData?: any) {
      const containsApiPath = (param: string) =>
        param.indexOf('api/rest/users/me?fields=') !== -1;

      if (resolveData) {
        fetch.mockResponseOnce((req: any) => {
          if (containsApiPath(req.url)) {
            return Promise.resolve(JSON.stringify(resolveData));
          }
        });
      } else {
        fetch.mockRejectOnce((url: string) => {
          if (containsApiPath(url)) {
            return Promise.reject(rejectData);
          }
        });
      }
    }
  });


  describe('Authorize & Refresh Token', () => {
    let AppAuth: any;
    beforeEach(() => {
      AppAuth = require('react-native-app-auth');
      jest.spyOn(auth, 'getCachedAuthParams');
    });

    describe('Authorize', () => {
      it('should authorize via login/password', async () => {
        jest
          .spyOn(Auth, 'obtainToken')
          .mockImplementationOnce(async () => authParamsMock);
        await Auth.obtainTokenByCredentials('log$', 'pass%', configMock);
        expect(Auth.obtainToken).toHaveBeenCalledWith(
          [
            'grant_type=password',
            '&access_type=offline',
            `&username=log%24`,
            `&password=pass%25`,
            `&scope=scope%23%20scope2`,
          ].join(''),
          configMock,
        );
      });

      it('should authorize with OAuth2 code flow', async () => {
        const oauthCodeFlowParamsMock = {
          accessToken: 'accessToken',
          refreshToken: 'refreshToken',
          tokenType: 'tokenType',
        };
        AppAuth.authorize.mockResolvedValueOnce(oauthCodeFlowParamsMock);
        const authParams = await Auth.obtainTokenWithOAuthCode(configMock);
        expect(authParams).toEqual({
          access_token: oauthCodeFlowParamsMock.accessToken,
          accessTokenExpirationDate: undefined,
          refresh_token: oauthCodeFlowParamsMock.refreshToken,
          token_type: oauthCodeFlowParamsMock.tokenType,
        });
        expect(AppAuth.authorize).toHaveBeenCalledWith({
          additionalParameters: {
            access_type: 'offline',
            prompt: 'login',
          },
          clientId: configMock.auth.clientId,
          clientSecret: 'client-secret',
          redirectUrl: configMock.auth.landingUrl,
          scopes: configMock.auth.scopes.split(' '),
          serviceConfiguration: {
            authorizationEndpoint: `${configMock.auth.serverUri}/api/rest/oauth2/auth`,
            tokenEndpoint: `${configMock.auth.serverUri}/api/rest/oauth2/token`,
          },
          usePKCE: false,
          dangerouslyAllowInsecureHttpRequests: true,
        });
      });
    });


    describe('refreshToken', () => {
      it('should refresh token', async () => {
        const responseMock = {
          accessToken: 'token',
        };
        AppAuth.refresh.mockResolvedValueOnce(responseMock);
        jest.spyOn(auth, 'loadCurrentUser').mockResolvedValueOnce({});
        auth.getCachedAuthParams.mockResolvedValueOnce(authParamsMock);
        const authParams = await auth.refreshToken();
        expect(AppAuth.refresh).toHaveBeenCalledWith(
          {
            clientId: configMock.auth.clientId,
            clientSecret: configMock.auth.clientSecret,
            redirectUrl: configMock.auth.landingUrl,
            dangerouslyAllowInsecureHttpRequests: true,
            serviceConfiguration: {
              authorizationEndpoint: `${configMock.auth.serverUri}/api/rest/oauth2/auth`,
              tokenEndpoint: `${configMock.auth.serverUri}/api/rest/oauth2/token`,
            },
          },
          {
            refreshToken: authParamsMock.refresh_token,
          },
        );
        expect(authParams).toEqual(responseMock);
      });

      it('should fail refresh if permission management service is unavailable', async () => {
        auth.getCachedAuthParams.mockResolvedValueOnce(authParamsMock);
        const error = new Error('Service unavailable');
        AppAuth.refresh.mockRejectedValueOnce(error);
        await expect(auth.refreshToken()).rejects.toThrow(error);
      });
    });
  });


  describe('Get/Save cached auth parameters', () => {
    describe('cacheAuthParams', () => {
      it('should cache encrypted auth params', async () => {
        jest.spyOn(storageHelper, 'storeSecurelyAuthParams');
        const cachedAuthParams = await auth.cacheAuthParams(
          authParamsMock,
          authParamsMockKey,
        );
        await expect(
          storageHelper.storeSecurelyAuthParams,
        ).toHaveBeenCalledWith(authParamsMock, authParamsMockKey);
        await expect(cachedAuthParams).toEqual(authParamsMock);
      });

      it('should cache encrypted auth params with particular key', async () => {
        jest.spyOn(storageHelper, 'storeSecurelyAuthParams');
        const keyMock = 'datestamp';
        const cachedAuthParams = await auth.cacheAuthParams(
          authParamsMock,
          keyMock,
        );
        await expect(
          storageHelper.storeSecurelyAuthParams,
        ).toHaveBeenCalledWith(authParamsMock, keyMock);
        await expect(cachedAuthParams).toEqual(authParamsMock);
      });
    });


    describe('getCachedAuthParams', () => {
      beforeEach(() => {
        jest.spyOn(storageHelper, 'getStoredSecurelyAuthParams');
      });

      it('should throw if there is no cached auth parameters', async () => {
        await expect(auth.getCachedAuthParams()).rejects.toThrow('');
      });

      it('should get auth parameters', async () => {
        jest
          .spyOn(EncryptedStorage, 'getItem')
          .mockResolvedValueOnce(JSON.stringify(authParamsMock));
        const cachedAuthParams = await auth.getCachedAuthParams();
        await expect(
          storageHelper.getStoredSecurelyAuthParams,
        ).toHaveBeenCalled();
        await expect(cachedAuthParams).toEqual(authParamsMock);
      });
    });
  });
});

function createAuthMock(config: AppConfig) {
  return new Auth(config || configMock);
}
