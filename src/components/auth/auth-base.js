/* @flow */

import qs from 'qs';
import urlJoin from 'url-join';
import log from '../log/log';
import PermissionsStore from '../permissions-store/permissions-store';
import {createBtoa} from '../../util/util';
import {USER_AGENT} from '../usage/usage';

import type {AppConfig} from '../../flow/AppConfig';
import type {CustomError, HTTPResponse} from '../../flow/Error';
import type {OAuthParams} from '../../flow/Auth';
import type {User} from '../../flow/User';

const ACCEPT_HEADER: string = 'application/json, text/plain, */*';
const URL_ENCODED_TYPE: string = 'application/x-www-form-urlencoded';


export class AuthBase {
  authParams: any;
  CHECK_TOKEN_URL: string;
  config: AppConfig;
  currentUser: User;
  PERMISSIONS_CACHE_URL: string;
  permissionsStore: PermissionsStore;

  constructor(config: AppConfig) {
    this.authParams = null;
    this.config = config;
    this.CHECK_TOKEN_URL = urlJoin(
      this.config.auth.serverUri,
      '/api/rest/users/me?fields=id,guest,name,profile/avatar/url,endUserAgreementConsent(accepted,majorVersion,minorVersion)'
    );
    const permissionsQueryString = qs.stringify({
      query: `service:{0-0-0-0-0} or service:{${config.auth.youtrackServiceId}}`,
      fields: 'permission/key,global,projects(id)',
    });
    this.PERMISSIONS_CACHE_URL = urlJoin(
      this.config.auth.serverUri, `/api/rest/permissions/cache?${permissionsQueryString}`
    );
  }

  static getHeaders(config: AppConfig): {
    'Accept': string,
    'User-Agent': string,
    'Authorization': string,
    'Content-Type': string
  } {
    return {
      'Accept': ACCEPT_HEADER,
      'User-Agent': USER_AGENT,
      'Authorization': `Basic ${createBtoa(`${config.auth.clientId}:${((config.auth.clientSecret: any): string)}`)}`,
      'Content-Type': URL_ENCODED_TYPE,
    };
  }

  static obtainToken(body: string, config: AppConfig): Promise<any> {}

  static obtainTokenByOAuthCode(code: string, config: AppConfig): Promise<any> {}

  static obtainTokenByCredentials(login: string, password: string, config: AppConfig): Promise<any> {}

  setAuthParamsFromCache(): Promise<void> {}

  getPermissionsCacheURL(): string {}

  getTokenType(): string {}

  getAccessToken(): string {}

  getRefreshToken(authParams: any): string {}

  logOut(): Promise<void> {}

  refreshToken(): Promise<any> {}

  getAuthorizationHeaders(authParams: OAuthParams = this.authParams): { Authorization: string, 'User-Agent': string } {
    if (!authParams) {
      throw new Error('Auth: getAuthorizationHeaders called before authParams initialization');
    }
    return {
      'Authorization': `${authParams.tokenType || authParams.token_type} ${authParams.accessToken || authParams.access_token}`,
    };
  }

  loadCurrentUser(authParams: any): Promise<any> {
    log.info('Verifying token, loading current user data...');
    return fetch(this.CHECK_TOKEN_URL, {
      headers: {
        'Accept': ACCEPT_HEADER,
        'Hub-API-Version': 2,
        'User-Agent': USER_AGENT,
        ...this.getAuthorizationHeaders(authParams),
      },
    }).then((res: HTTPResponse | CustomError) => {
      if (res.status > 400) {
        const errorTitle: string = 'Check token error';
        log.log(errorTitle, res);
        throw res;
      }
      log.info('Token has been verified');
      return res.json();
    })
      .then((currentUser: User) => {
        this.currentUser = currentUser;
        log.info('Current user loaded');
        return authParams;
      })
      .catch((error: CustomError) => {
        if (error.status === 401 && this.getRefreshToken(authParams)) {
          log.log('Trying to refresh token', error);
          return this.refreshToken();
        }
        throw error;
      })
      .catch((err: CustomError) => {
        log.log('Error during token validation', err);
        throw err;
      });
  }

  cacheAuthParams(authParams: any, key?: string): Promise<any> {}

  getCachedAuthParams(): Promise<any> {}

}

