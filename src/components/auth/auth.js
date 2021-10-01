/* @flow */

import EncryptedStorage from 'react-native-encrypted-storage';

import log from '../log/log';
import urlJoin from 'url-join';
import {AuthBase} from './auth-base';
import {getStoredSecurelyAuthParams, storeSecurelyAuthParams} from '../storage/storage__oauth';
import {STORAGE_AUTH_PARAMS_KEY} from '../storage/storage';

import type {AppConfig} from '../../flow/AppConfig';
import type {AuthParams} from '../../flow/Auth';


export default class AuthTest extends AuthBase {
  authParams: AuthParams;

  static obtainToken(body: string, config: AppConfig): Promise<AuthParams> {
    const hubTokenUrl = urlJoin(config.auth.serverUri, '/api/rest/oauth2/token');
    return fetch(hubTokenUrl, {
      method: 'POST',
      headers: AuthTest.getHeaders(config),
      body: body,
    }).then(async res => {
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

  static obtainTokenByOAuthCode(code: string, config: AppConfig): Promise<AuthParams> {
    log.info('Obtaining token for code', code, config.auth.serverUri);

    return this.obtainToken([
      'grant_type=authorization_code',
      `&code=${code}`,
      `&client_id=${config.auth.clientId}`,
      `&client_secret=${((config.auth.clientSecret: any): string)}`,
      `&redirect_uri=${config.auth.landingUrl}`,
    ].join(''), config);
  }

  static obtainTokenByCredentials(login: string, password: string, config: AppConfig): Promise<AuthParams> {
    log.info(`Obtaining token by credentials on ${config.auth.serverUri} for "${login}"`);
    return this.obtainToken([
      'grant_type=password',
      '&access_type=offline',
      `&username=${encodeURIComponent(login)}`,
      `&password=${encodeURIComponent(password)}`,
      `&scope=${encodeURIComponent(config.auth.scopes)}`,
    ].join(''), config);
  }

  setAuthParamsFromCache(): Promise<void> {
    return this.getCachedAuthParams()
      .then((authParams) => this.loadCurrentUser(authParams))
      .then((authParams) => {
        this.authParams = authParams;
      });
  }

  getPermissionsCacheURL(): string {
    return this.PERMISSIONS_CACHE_URL;
  }

  getTokenType(): string {
    return this.authParams?.token_type || '';
  }

  getAccessToken(): string {
    return this.authParams?.access_token || '';
  }

  getRefreshToken(): string {
    return this.authParams?.refresh_token || '';
  }

  async logOut() {
    await EncryptedStorage.removeItem(STORAGE_AUTH_PARAMS_KEY, () => {
      EncryptedStorage.setItem(STORAGE_AUTH_PARAMS_KEY, '');
    });
    this.authParams = null;
  }

  refreshToken(): Promise<AuthParams> {
    let token;
    const config = this.config;
    const requestToken = (authParams: AuthParams) => fetch(urlJoin(
      config.auth.serverUri,
      '/api/rest/oauth2/token',
      '?grant_type=refresh_token',
      `&refresh_token=${authParams.refresh_token}`
    ), {
      method: 'POST',
      headers: AuthTest.getHeaders(config),
    });

    return this.getCachedAuthParams()
      .then((authParams: AuthParams) => {
        log.info('Starting token refresh...');

        //store old refresh token
        token = authParams.refresh_token;
        return requestToken(authParams);
      })
      .then(res => res.json())
      .then(async (authParams: AuthParams) => {
        if (!authParams.error_code) {
          log.info('Token has been refreshed.');
          //restore old refresh token
          authParams.refresh_token = authParams.refresh_token || token;
        } else {
          const message: string = 'Token refreshing failed';
          log.warn(message, authParams);
          throw authParams;
        }
        return authParams;
      })
      .then((authParams: AuthParams) => this.loadCurrentUser(authParams))
      .then((authParams: AuthParams) => this.cacheAuthParams(authParams))
      .then((authParams: AuthParams) => {
        this.authParams = authParams;
        return authParams;
      });
  }

  getAuthorizationHeaders(authParams: ?AuthParams = this.authParams): { Authorization: string, 'User-Agent': string } {
    if (!authParams) {
      throw new Error('Auth: getAuthorizationHeaders called before authParams initialization');
    }
    return {
      'Authorization': `${authParams.token_type} ${authParams.access_token}`,
    };
  }

  async cacheAuthParams(authParams: AuthParams, key?: string): Promise<AuthParams> {
    await storeSecurelyAuthParams(authParams, key);
    return authParams;
  }

  async getCachedAuthParams(): Promise<AuthParams> {
    const authParams: ?AuthParams = await getStoredSecurelyAuthParams();
    if (!authParams) {
      throw new Error('No stored auth params found');
    }
    return authParams;
  }
}
