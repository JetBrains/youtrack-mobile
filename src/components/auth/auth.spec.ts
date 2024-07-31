import EncryptedStorage from 'react-native-encrypted-storage';
import {enableFetchMocks} from 'jest-fetch-mock';

import * as AuthApp from 'react-native-app-auth';
import * as storageHelper from 'components/storage/storage__oauth';
import OAuth2 from './oauth2';
import mocks from 'test/mocks';
import {__setStorageState} from 'components/storage/storage';
import {ERROR_MESSAGE_DATA} from 'components/error/error-message-data';

import type {AppConfig} from 'types/AppConfig';
import type {AuthParams} from 'types/Auth';
import type {CustomError} from 'types/Error';
import type {FetchMock, ErrorOrFunction} from 'jest-fetch-mock';

jest.mock('react-native-app-auth');
enableFetchMocks();

let appConfigMock: AppConfig;
let authParamsMock: AuthParams;
let authParamsMockKey: string;
let auth: OAuth2;

describe('OAuth', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    (fetch as FetchMock).resetMocks();
  });
  beforeEach(() => {
    appConfigMock = mocks.createConfigMock() as AppConfig;
    authParamsMock = mocks.createAuthParamsMock() as AuthParams;
    authParamsMockKey = '0123';

    __setStorageState({
      authParamsKey: authParamsMockKey,
    });

    auth = createAuthMock();
  });
  it('should exists', () => {
    expect(OAuth2).toBeDefined();
  });
  it('should create OAuth instance', () => {
    expect(auth).toBeDefined();
  });

  describe('loadCurrentUser', () => {
    describe('Refresh token if unauthorized', () => {
      it('should invoke a re-login callback if loading current user failed during access token refresh', async () => {
        jest.spyOn(auth, 'refreshToken').mockImplementationOnce(() => {
          throw 'Token invalid';
        });
        mockLoadCurrentUserResponse(null, {status: 401});

        await auth.loadCurrentUser(authParamsMock);

        expect(auth.onTokenRefreshError).toHaveBeenCalledWith();
      });
    });

    describe('Flow', () => {
      let errorMock: CustomError;
      beforeEach(() => {
        errorMock = new Error('Invalid') as CustomError;
        jest.spyOn(auth, 'getRefreshToken');
        jest.spyOn(auth, 'refreshToken').mockImplementationOnce(() => null);
      });
      it('should throw if request responded with an error', async () => {
        mockLoadCurrentUserResponse(null, errorMock);
        await expect(auth.loadCurrentUser(authParamsMock)).rejects.toThrow(
          errorMock,
        );
      });

      it('should throw if the current user is banned', async () => {
        mockLoadCurrentUserResponse({
          banned: true,
        });
        await expect(auth.loadCurrentUser(authParamsMock)).rejects.toThrow(
          new Error(ERROR_MESSAGE_DATA.USER_BANNED.title),
        );
      });

      it('should not refresh a token if user has no required permissions', async () => {
        errorMock.status = 403;
        doMockGetRefreshToken('prevToken');
        mockLoadCurrentUserResponse(null, errorMock);
        await expect(auth.loadCurrentUser(authParamsMock)).rejects.toThrow();
        expect(auth.refreshToken).not.toHaveBeenCalled();
      });

      it('should refresh a token if a token is out of date', async () => {
        errorMock.status = 401;
        doMockGetRefreshToken('prevToken');
        mockLoadCurrentUserResponse(null, errorMock);
        await auth.loadCurrentUser(authParamsMock);
        expect(auth.refreshToken).toHaveBeenCalled();
      });

      it('should not refresh a token if there is no auth params in a cache', async () => {
        errorMock.status = 401;
        doMockGetRefreshToken('');
        mockLoadCurrentUserResponse(null, errorMock);
        await expect(auth.loadCurrentUser(authParamsMock)).rejects.toThrow();
        expect(auth.refreshToken).not.toHaveBeenCalled();
      });

      it('should set the current user', async () => {
        const userMock = {
          id: 'currentUser',
        };
        mockLoadCurrentUserResponse(userMock);
        await auth.loadCurrentUser(authParamsMock);
        expect(auth.currentUser).toEqual(userMock);
      });

      function doMockGetRefreshToken(token: string) {
        (auth.getRefreshToken as jest.Mock).mockReturnValueOnce(token);
      }

    });

  });

  describe('Authorize & Refresh Token', () => {
    let AppAuth: typeof AuthApp;
    const refreshTokenResult = {
      accessToken: 'accessToken',
      refreshToken: 'refreshToken',
      tokenType: 'tokenType',
    };
    beforeEach(() => {
      AppAuth = require('react-native-app-auth');
      jest.spyOn(auth, 'getCachedAuthParams');
    });

    describe('Authorize', () => {
      it('should authorize via login/password', async () => {
        jest.spyOn(OAuth2, 'obtainToken').mockImplementationOnce(async () => authParamsMock);
        await OAuth2.obtainTokenByCredentials('log$', 'pass%', appConfigMock);
        expect(OAuth2.obtainToken).toHaveBeenCalledWith(
          [
            'grant_type=password',
            '&access_type=offline',
            `&username=log%24`,
            `&password=pass%25`,
            `&scope=scope%23%20scope2`,
          ].join(''),
          appConfigMock
        );
      });

      it('should authorize with OAuth2 code flow', async () => {
        (AppAuth.authorize as jest.Mock).mockResolvedValueOnce(refreshTokenResult);
        const authParams = await OAuth2.obtainTokenWithOAuthCode(appConfigMock);

        expect(authParams).toEqual({
          access_token: refreshTokenResult.accessToken,
          refresh_token: refreshTokenResult.refreshToken,
          token_type: refreshTokenResult.tokenType,
          scope: appConfigMock.auth.scopes,
        });

        expect(AppAuth.authorize).toHaveBeenCalledWith({
          additionalParameters: {
            access_type: 'offline',
            prompt: 'login',
          },
          clientId: appConfigMock.auth.clientId,
          clientSecret: 'client-secret',
          redirectUrl: appConfigMock.auth.landingUrl,
          scopes: appConfigMock.auth.scopes.split(' '),
          serviceConfiguration: {
            authorizationEndpoint: `${appConfigMock.auth.serverUri}/api/rest/oauth2/auth`,
            tokenEndpoint: `${appConfigMock.auth.serverUri}/api/rest/oauth2/token`,
          },
          usePKCE: false,
          dangerouslyAllowInsecureHttpRequests: true,
        });
      });
    });

    describe('refreshToken', () => {
      let prevAuthParams: AuthParams;

      beforeEach(() => {
        prevAuthParams = {
          ...authParamsMock,
          scope: auth.config.auth.scopes,
        };
        jest.spyOn(auth, 'loadCurrentUser').mockResolvedValueOnce({});
        (auth.getCachedAuthParams as jest.Mock).mockResolvedValueOnce(authParamsMock);
        auth.setAuthParams(prevAuthParams);
      });

      it('should refresh token', async () => {
        const scopes = prevAuthParams.scope.split(' ');
        const refreshResponseMock = refreshTokenResult;
        (AppAuth.refresh as jest.Mock).mockResolvedValueOnce({...refreshResponseMock, scopes: scopes});
        const authParams = await auth.refreshToken();

        const {serverUri, clientId, clientSecret, landingUrl} = appConfigMock.auth;
        const serverAuthURL = `${serverUri}/api/rest/oauth2`;

        expect(AppAuth.refresh).toHaveBeenCalledWith(
          {
            clientId,
            clientSecret,
            redirectUrl: landingUrl,
            dangerouslyAllowInsecureHttpRequests: true,
            scopes,
            serviceConfiguration: {
              authorizationEndpoint: `${serverAuthURL}/auth`,
              tokenEndpoint: `${serverAuthURL}/token`,
            },
          },
          {
            refreshToken: prevAuthParams.refresh_token,
          }
        );

        expect(authParams).toEqual({
          access_token: refreshResponseMock.accessToken,
          refresh_token: refreshResponseMock.refreshToken,
          scope: auth.config.auth.scopes,
          token_type: refreshResponseMock.tokenType,
        });
      });

      it('should set prev refresh token', async () => {
        const refreshResponseMock = {
          accessToken: 'accessToken',
          refreshToken: '',
          tokenType: 'tokenType',
        };
        (AppAuth.refresh as jest.Mock).mockResolvedValueOnce(refreshResponseMock);

        const authParams = await auth.refreshToken();

        expect(authParams.refresh_token).toEqual(prevAuthParams.refresh_token);
      });

      it('should fail refresh if permission management service is unavailable', async () => {
        (auth.getCachedAuthParams as jest.Mock).mockResolvedValueOnce(authParamsMock);
        const error = new Error('Service unavailable');
        (AppAuth.refresh as jest.Mock).mockRejectedValueOnce(error);

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

function createAuthMock(config: AppConfig = appConfigMock) {
  return new OAuth2(config, jest.fn());
}

function mockLoadCurrentUserResponse(resolveData: any, rejectData?: any) {
  const containsApiPath = (param: string) => param.indexOf('api/rest/users/me?fields=') !== -1;
  const _fetch = fetch as FetchMock;
  if (resolveData) {
    _fetch.mockResponseOnce((req: Request) => {
      return Promise.resolve(JSON.stringify(containsApiPath(req.url) ? resolveData : req));
    });
  } else {
    _fetch.mockRejectOnce((url: ErrorOrFunction) => {
      if (containsApiPath(url as unknown as string)) {
        return Promise.reject(rejectData);
      }
      return Promise.reject(url);
    });
  }
}
