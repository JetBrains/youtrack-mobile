/* @flow */

import EncryptedStorage from 'react-native-encrypted-storage';
import qs from 'qs';
import urlJoin from 'url-join';

import log from '../log/log';
import PermissionsStore from '../permissions-store/permissions-store';
import {ACCEPT_HEADER, revokeToken, URL_ENCODED_TYPE} from './oauth2-helper';
import {createBtoa} from '../../util/util';
import {ERROR_MESSAGE_DATA} from '../error/error-message-data';
import {getAuthParamsKey, getStoredSecurelyAuthParams, storeSecurelyAuthParams} from '../storage/storage__oauth';
import {HTTP_STATUS} from '../error/error-http-codes';
import {STORAGE_AUTH_PARAMS_KEY} from '../storage/storage';
import {USER_AGENT} from '../usage/usage';

import type {AppConfig} from '../../flow/AppConfig';
import type {OAuthParams2} from '../../flow/Auth';
import type {CustomError} from '../../flow/Error';
import type {User} from '../../flow/User';


export class AuthBase {
  authParams: any;
  LOAD_USER_URL: string;
  config: AppConfig;
  currentUser: User;
  PERMISSIONS_CACHE_URL: string;
  permissionsStore: PermissionsStore;

  constructor(config: AppConfig) {
    this.authParams = null;
    this.config = config;
    this.LOAD_USER_URL = urlJoin(
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
    const authorization: string = `Basic ${createBtoa(
      `${config.auth.clientId}:${((config.auth.clientSecret: any): string)}`)}`;
    log.info(`AuthBase(getHeaders): ${authorization}`);
    return {
      'Accept': ACCEPT_HEADER,
      'User-Agent': USER_AGENT,
      'Authorization': authorization,
      'Content-Type': URL_ENCODED_TYPE,
    };
  }

  static obtainToken(body: string, config: AppConfig): Promise<OAuthParams2> {
    const hubTokenUrl = urlJoin(config.auth.serverUri, '/api/rest/oauth2/token');
    return fetch(hubTokenUrl, {
      method: 'POST',
      headers: AuthBase.getHeaders(config),
      body: body,
    }).then(async (res: Response & any) => {
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

  static async obtainTokenWithOAuthCode(config: AppConfig): any {}

  static obtainTokenByCredentials(login: string, password: string, config: AppConfig): Promise<OAuthParams2> {
    log.info(`Obtaining token by credentials on ${config.auth.serverUri} for "${login}"`);
    return this.obtainToken([
      'grant_type=password',
      '&access_type=offline',
      `&username=${encodeURIComponent(login)}`,
      `&password=${encodeURIComponent(password)}`,
      `&scope=${encodeURIComponent(config.auth.scopes)}`,
    ].join(''), config);
  }

  checkAuthorization(): any {}

  getPermissionsCacheURL(): string {
    return this.PERMISSIONS_CACHE_URL;
  }

  getTokenType(): string {
    return '';
  }

  getAccessToken(): string {
    return '';
  }

  getRefreshToken(authParams: any): string {
    return '';
  }

  async logOut(): Promise<void> {
    await EncryptedStorage.removeItem(STORAGE_AUTH_PARAMS_KEY, () => {
      EncryptedStorage.setItem(STORAGE_AUTH_PARAMS_KEY, '');
    });
    if (this.authParams.accessToken) {
      await revokeToken(this.config, this.authParams.accessToken);
    }
    this.authParams = null;
  }

  refreshToken(): Promise<any> {
    let prevToken: string;
    const config = this.config;
    const requestToken = (authParams: OAuthParams2) => fetch(urlJoin(
      config.auth.serverUri,
      '/api/rest/oauth2/token',
      '?grant_type=refresh_token',
      `&refresh_token=${this.getRefreshToken(authParams)}`
    ), {
      method: 'POST',
      headers: AuthBase.getHeaders(config),
    });

    return this.getCachedAuthParams()
      .then((authParams: OAuthParams2) => {
        log.info('Starting token refresh...');

        //store old refresh token
        prevToken = authParams.refresh_token;
        return requestToken(authParams);
      })
      .then(res => res.json())
      .then(async (authParams: OAuthParams2) => {
        if (!authParams.error_code) {
          log.info('Token has been refreshed.');
          //restore old refresh token
          authParams.refresh_token = authParams.refresh_token || prevToken;
        } else {
          const message: string = 'Token refreshing failed';
          log.warn(message, authParams);
          throw authParams;
        }
        return authParams;
      })
      .then((authParams: OAuthParams2) => this.loadCurrentUser(authParams))
      .then((authParams: OAuthParams2) => this.cacheAuthParams(authParams, getAuthParamsKey()))
      .then((authParams: OAuthParams2) => {
        this.authParams = authParams;
        return authParams;
      });
  }

  getAuthorizationHeaders(authParams: OAuthParams2 = this.authParams): {
    Authorization: string,
    'User-Agent': string
  } {
    if (!authParams) {
      throw new Error('Auth: getAuthorizationHeaders called before authParams initialization');
    }
    const tokenType: string = authParams.tokenType || authParams.token_type;
    const accessToken: string = authParams.accessToken || authParams.access_token;
    const authHeaders: { 'Authorization': string, 'User-Agent': string } = {
      'Authorization': `${tokenType} ${accessToken}`,
      'User-Agent': USER_AGENT,
    };
    log.info('getAuthorizationHeaders: ', authHeaders);
    return authHeaders;
  }

  loadCurrentUser(authParams: any): Promise<any> {
    log.info('loadCurrentUser: Verifying token, loading current user...');
    return fetch(this.LOAD_USER_URL, {
      headers: {
        'Accept': ACCEPT_HEADER,
        'Hub-API-Version': 2,
        ...this.getAuthorizationHeaders(authParams),
      },
    }).then((res: Response) => {
      if (res.status > 400) {
        log.log(`loadCurrentUser: Error ${res.status}. Verifying token...`, res);
        throw res;
      }
      log.info('loadCurrentUser: Token refreshed.');
      return res.json();
    })
      .then((currentUser: User) => {
        if (currentUser.banned) {
          const e: CustomError = ((new Error(ERROR_MESSAGE_DATA.USER_BANNED.title)): any);
          e.status = HTTP_STATUS.FORBIDDEN;
          throw e;
        }
        this.currentUser = currentUser;
        log.info('loadCurrentUser: Current user updated.');
        return authParams;
      })
      .catch((error: CustomError) => {
        const prevToken: ?string = this.getRefreshToken(authParams);
        if (!prevToken) {
          log.warn('loadCurrentUser: Previous token is undefined.');
        }
        if (error.status === 401 && prevToken) {
          log.log('loadCurrentUser: Token refresh.', error);
          return this.refreshToken();
        }
        throw error;
      })
      .catch((err: CustomError) => {
        log.log(`loadCurrentUser: Token refresh failed. Error ${err.status}`, err);
        throw err;
      });
  }

  async cacheAuthParams(authParams: OAuthParams2, timestamp: string): Promise<OAuthParams2> {
    await storeSecurelyAuthParams(authParams, timestamp);
    return authParams;
  }

  async getCachedAuthParams(): Promise<OAuthParams2> {
    const authParamsKey = getAuthParamsKey();
    const authParams: ?OAuthParams2 = await getStoredSecurelyAuthParams(authParamsKey);
    if (!authParams) {
      throw new Error('No stored auth params found');
    }
    return authParams;
  }

}

