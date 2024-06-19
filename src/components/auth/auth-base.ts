import qs from 'qs';

import log from 'components/log/log';
import PermissionsStore from 'components/permissions-store/permissions-store';
import {ACCEPT_HEADER, URL_ENCODED_TYPE} from './oauth2-helper';
import {createBtoa} from 'util/util';
import {ERROR_MESSAGE_DATA} from 'components/error/error-message-data';
import {
  getAuthParamsKey,
  getStoredSecurelyAuthParams,
  storeSecurelyAuthParams,
} from '../storage/storage__oauth';
import {HTTP_STATUS} from 'components/error/error-http-codes';
import {USER_AGENT} from 'components/usage/usage';

import type {AppConfig} from 'types/AppConfig';
import type {AuthParams, RequestHeaders} from 'types/Auth';
import type {CustomError} from 'types/Error';
import type {User} from 'types/User';

export class AuthBase {
  authParams: AuthParams | null;
  LOAD_USER_URL: string;
  config: AppConfig;
  currentUser: User | null;
  PERMISSIONS_CACHE_URL: string;
  permissionsStore: PermissionsStore;

  constructor(config: AppConfig) {
    this.authParams = null;
    this.config = config;
    this.LOAD_USER_URL = `${this.config.auth.serverUri}/api/rest/users/me?fields=id,guest,name,profile/avatar/url,endUserAgreementConsent(accepted,majorVersion,minorVersion)`;
    const permissionsQueryString = qs.stringify({
      query: `service:{0-0-0-0-0} or service:{${config.auth.youtrackServiceId}}`,
      fields: 'permission/key,global,projects(id)',
    });
    this.PERMISSIONS_CACHE_URL = `${this.config.auth.serverUri}/api/rest/permissions/cache?${permissionsQueryString}`;
    this.getAuthorizationHeaders = this.getAuthorizationHeaders.bind(this);
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
      .then(async (res: Response & any) => {
        log.log(`Got result from ${hubTokenUrl}: ${res && res.status}`);
        log.log(`Response body: ${res && res._bodyText}`);
        return res.json();
      })
      .then(res => {
        if (res.error) {
          throw res;
        }

        return res;
      });
  }

  static async obtainTokenWithOAuthCode(config: AppConfig): Promise<void> {}

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

  setCurrentUser(user: User | null): void {
    this.currentUser = user;
  }

  logOut(): void {
    this.authParams = null;
    this.setCurrentUser(null);
  }

  async refreshToken(): Promise<any> {}

  getAuthorizationHeaders(authParams?: AuthParams): RequestHeaders {
    const headers: RequestHeaders = {
      'User-Agent': USER_AGENT,
    };

    const _authParams: AuthParams | null | undefined = authParams || this.authParams;

    if (_authParams) {
      headers.Authorization = `${_authParams.token_type} ${_authParams.access_token}`;
    }

    return headers;
  }

  loadCurrentUser(authParams: AuthParams) {
    log.info('Auth: loadCurrentUser: Verifying token, loading current user...');
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
            `loadCurrentUser: Error ${res.status}. Verifying token...`,
            res,
          );
          throw res;
        }

        log.info('Auth: loadCurrentUser: Token refreshed.');
        return res.json();
      })
      .then((currentUser: User) => {
        if (currentUser.banned) {
          const e: CustomError = new Error(
            ERROR_MESSAGE_DATA.USER_BANNED.title,
          ) as any;
          e.status = HTTP_STATUS.FORBIDDEN;
          throw e;
        }

        this.setCurrentUser(currentUser);
        log.info('Auth: loadCurrentUser: Current user updated.');
        return authParams;
      })
      .catch((error: CustomError) => {
        const prevToken: string | null | undefined = this.getRefreshToken(
          authParams,
        );

        if (!prevToken) {
          log.warn('Auth: loadCurrentUser: Previous token is undefined.');
        }

        if (error.status === 401 && prevToken) {
          log.log('loadCurrentUser: Token refresh.', error);
          return this.refreshToken();
        }

        throw error;
      })
      .catch((err: CustomError) => {
        log.log(
          `loadCurrentUser: Token refresh failed. Error ${err.status}`,
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
      log.log('No stored auth params found');
      throw new Error('');
    }

    return authParams;
  }
}
