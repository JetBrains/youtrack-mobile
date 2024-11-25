import qs from 'qs';

import log from 'components/log/log';
import {ACCEPT_HEADER, URL_ENCODED_TYPE} from './oauth2-helper';
import {createBtoa} from 'util/util';
import {ERROR_MESSAGE_DATA} from 'components/error/error-message-data';
import {
  getAuthParamsKey,
  getStoredSecurelyAuthParams,
  storeSecurelyAuthParams,
} from '../storage/storage__oauth';
import {USER_AGENT} from 'components/usage/usage';

import type {AnyError, CustomError} from 'types/Error';
import type {AppConfig} from 'types/AppConfig';
import type {AuthParams, RequestHeaders, RequestHeadersExtended} from 'types/Auth';
import type {UserHub} from 'types/User';

export class AuthBase {
  authParams: AuthParams | null;
  LOAD_USER_URL: string;
  config: AppConfig;
  currentUser: UserHub | null;
  PERMISSIONS_CACHE_URL: string;
  onTokenRefreshError: (errorMsg?: string) => void = () => {};

  constructor(config: AppConfig, onTokenRefreshError: () => void) {
    this.authParams = null;
    this.currentUser = null;
    this.config = config;
    this.LOAD_USER_URL = `${this.config.auth.serverUri}/api/rest/users/me?fields=id,guest,name,banned,profile/avatar/url,endUserAgreementConsent(accepted)`;
    const permissionsQueryString = qs.stringify({
      query: `service:{0-0-0-0-0} or service:{${config.auth.youtrackServiceId}}`,
      fields: 'permission/key,global,projects(id)',
    });
    this.PERMISSIONS_CACHE_URL = `${this.config.auth.serverUri}/api/rest/permissions/cache?${permissionsQueryString}`;
    this.getAuthorizationHeaders = this.getAuthorizationHeaders.bind(this);
    this.onTokenRefreshError = onTokenRefreshError;
  }

  static getHeaders(
    config: AppConfig,
  ): {
    Accept: string;
    'User-Agent': string;
    Authorization: string;
    'Content-Type': string;
  } {
    const authorization: string = `Basic ${createBtoa(
      `${config.auth.clientId}:${(config.auth.clientSecret as any) as string}`,
    )}`;
    return {
      Accept: ACCEPT_HEADER,
      'User-Agent': USER_AGENT,
      Authorization: authorization,
      'Content-Type': URL_ENCODED_TYPE,
    };
  }

  static obtainToken(body: string, config: AppConfig): Promise<AuthParams> {
    const hubTokenUrl = `${config.auth.serverUri}/api/rest/oauth2/token`;
    return fetch(hubTokenUrl, {
      method: 'POST',
      headers: AuthBase.getHeaders(config),
      body: body,
    })
      .then(async (res: Response) => {
        log.log(`Got result from ${hubTokenUrl}: ${res.status}`);
        return res.json();
      })
      .then(res => {
        if (res.error) {
          throw res;
        }

        return res;
      });
  }

  static async obtainTokenWithOAuthCode(_: AppConfig): Promise<void | AuthParams> {}

  static obtainTokenByCredentials(
    login: string,
    password: string,
    config: AppConfig,
  ): Promise<AuthParams> {
    log.info(`Auth: Obtaining token by credentials`);
    return this.obtainToken(
      [
        'grant_type=password',
        '&access_type=offline',
        `&username=${encodeURIComponent(login)}`,
        `&password=${encodeURIComponent(password)}`,
        `&scope=${encodeURIComponent(config.auth.scopes)}`,
      ].join(''),
      config,
    );
  }

  getPermissionsCacheURL(): string {
    return this.PERMISSIONS_CACHE_URL;
  }

  getTokenType(): string {
    return (this.authParams as AuthParams)?.token_type;
  }

  getAccessToken(): string {
    return (this.authParams as AuthParams)?.access_token;
  }

  getRefreshToken(authParams: AuthParams): string {
    return authParams.refresh_token;
  }

  setCurrentUser(user: UserHub | null) {
    this.currentUser = user;
  }

  logOut() {
    this.authParams = null;
    this.setCurrentUser(null);
  }

  async refreshToken(): Promise<any> {}

  getAuthorizationHeaders(authParams?: AuthParams): RequestHeaders | RequestHeadersExtended {
    const headers: RequestHeaders = {
      'User-Agent': USER_AGENT,
    };

    const _authParams: AuthParams | null | undefined = authParams || this.authParams;

    if (_authParams) {
      headers.Authorization = `${_authParams.token_type} ${_authParams.access_token}`;
    }

    return headers;
  }

  loadCurrentHubUser(authParams: AuthParams) {
    log.info('AuthBase(loadCurrentUser): Verifying token, loading current user...');
    return fetch(this.LOAD_USER_URL, {
      headers: {
        Accept: ACCEPT_HEADER,
        'Hub-API-Version': '2',
        ...this.getAuthorizationHeaders(authParams),
      },
    })
      .then((res: Response) => {
        if (res.status > 400) {
          log.log(
            `AuthBase(loadCurrentUser):Error: ${res.status}. Verifying token...`,
            res,
          );
          throw res;
        }

        log.info('AuthBase(loadCurrentUser): Current user loaded.');
        return res.json();
      })
      .then((hubUser: UserHub) => {
        if (hubUser.banned) {
          throw new Error(ERROR_MESSAGE_DATA.USER_BANNED.title);
        }

        this.setCurrentUser(hubUser);
        log.info('AuthBase(loadCurrentUser): Current user updated.');
        return authParams;
      })
      .catch(async (error: CustomError) => {
        const prevToken: string | undefined = this.getRefreshToken(authParams);

        if (!prevToken) {
          log.warn('AuthBase(loadCurrentUser):Error: Previous token is undefined.');
        }

        if (error.status === 401 && prevToken) {
          log.log('AuthBase(loadCurrentUser):Unauthorised: Refreshing token...', error?.message);
          try {
            await this.refreshToken();
          } catch (e) {
            const err = e as AnyError;
            let errorMsg = err?.message != null ? err.message : '';
            if (errorMsg.indexOf('The owner of the refresh token is banned') !== -1) {
              errorMsg = ERROR_MESSAGE_DATA.USER_BANNED.title;
            }
            this.onTokenRefreshError(errorMsg);
          }
          return;
        }

        throw error;
      })
      .catch((err: CustomError) => {
        log.log(
          `AuthBase(loadCurrentUser):Error: Token refresh failed. ${err.status}`,
          err,
        );
        throw err;
      });
  }

  async cacheAuthParams(
    authParams: AuthParams,
    timestamp: string,
  ): Promise<AuthParams> {
    await storeSecurelyAuthParams(authParams, timestamp);
    return authParams;
  }

  async getCachedAuthParams(): Promise<AuthParams> {
    const authParamsKey = getAuthParamsKey();
    const authParams:
      | AuthParams
      | null
      | undefined = await getStoredSecurelyAuthParams(authParamsKey);

    if (!authParams) {
      throw new Error('No stored auth params found');
    }

    return authParams;
  }
}
