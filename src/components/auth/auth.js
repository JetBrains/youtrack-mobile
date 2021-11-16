/* @flow */

import EncryptedStorage from 'react-native-encrypted-storage';
import qs from 'qs';

import log from '../log/log';
import PermissionsStore from '../permissions-store/permissions-store';
import urlJoin from 'url-join';
import {createBtoa} from '../../util/util';
import {ERROR_MESSAGE_DATA} from '../error/error-message-data';
import {HTTP_STATUS} from '../error/error-http-codes';
import {storeAuthParams, getStoredAuthParams, STORAGE_AUTH_PARAMS_KEY} from '../storage/storage';
import {USER_AGENT} from '../usage/usage';

import type {AppConfigFilled} from '../../flow/AppConfig';
import type {AuthParams} from '../../flow/Auth';
import type {CustomError, HTTPResponse} from '../../flow/Error';
import type {User} from '../../flow/User';

const ACCEPT_HEADER = 'application/json, text/plain, */*';
const URL_ENCODED_TYPE = 'application/x-www-form-urlencoded';


export default class AuthTest {
  CHECK_TOKEN_URL: string;
  PERMISSIONS_CACHE_URL: string;

  config: AppConfigFilled;
  authParams: ?AuthParams;

  permissionsStore: PermissionsStore;
  currentUser: User;

  constructor(config: AppConfigFilled) {
    this.authParams = null;
    this.config = config;
    this.CHECK_TOKEN_URL = urlJoin(
      this.config.auth.serverUri,
      '/api/rest/users/me?fields=id,guest,name,profile/avatar/url,endUserAgreementConsent(accepted,majorVersion,minorVersion),banned'
    );

    const permissionsQueryString = qs.stringify({
      query: `service:{0-0-0-0-0} or service:{${config.auth.youtrackServiceId}}`,
      fields: 'permission/key,global,projects(id)',
    });
    this.PERMISSIONS_CACHE_URL = urlJoin(
      this.config.auth.serverUri,
      `/api/rest/permissions/cache?${permissionsQueryString}`
    );
  }

  static obtainToken(body: string, config: AppConfigFilled): AuthParams {
    const hubTokenUrl = urlJoin(config.auth.serverUri, '/api/rest/oauth2/token');

    return fetch(hubTokenUrl, {
      method: 'POST',
      headers: {
        'Accept': ACCEPT_HEADER,
        'User-Agent': USER_AGENT,
        'Authorization': `Basic ${createBtoa(`${config.auth.clientId}:${config.auth.clientSecret}`)}`,
        'Content-Type': URL_ENCODED_TYPE,
      },
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

  static obtainTokenByOAuthCode(code: string, config: AppConfigFilled): AuthParams {
    log.info('Obtaining token for code', code, config.auth.serverUri);

    return this.obtainToken([
      'grant_type=authorization_code',
      `&code=${code}`,
      `&client_id=${config.auth.clientId}`,
      `&client_secret=${config.auth.clientSecret}`,
      `&redirect_uri=${config.auth.landingUrl}`,
    ].join(''), config);
  }

  static obtainTokenByCredentials(login: string, password: string, config: AppConfigFilled): AuthParams {
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
      .then((authParams) => this.verifyToken(authParams))
      .then((authParams) => {
        this.authParams = authParams;
      });
  }

  getPermissionsCacheURL(): string {
    return this.PERMISSIONS_CACHE_URL;
  }

  async logOut() {
    await EncryptedStorage.removeItem(STORAGE_AUTH_PARAMS_KEY, () => {
      EncryptedStorage.setItem(STORAGE_AUTH_PARAMS_KEY, '');
    });
    delete this.authParams;
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
      headers: {
        'Accept': ACCEPT_HEADER,
        'User-Agent': USER_AGENT,
        'Authorization': `Basic ${createBtoa(`${config.auth.clientId}:${config.auth.clientSecret}`)}`,
        'Content-Type': URL_ENCODED_TYPE,
      },
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
      .then((authParams: AuthParams) => this.verifyToken(authParams))
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
      'User-Agent': USER_AGENT,
    };
  }

  /**
   * Not sure that check is still required.
   */
  verifyToken(authParams: AuthParams): Promise<AuthParams> {
    log.info('Verifying token...');

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
        if (currentUser.banned) {
          const e: CustomError = ((new Error(ERROR_MESSAGE_DATA.USER_BANNED.title)): any);
          e.status = HTTP_STATUS.FORBIDDEN;
          throw e;
        }
        this.currentUser = currentUser;
        return authParams;
      })
      .catch((error: CustomError) => {
        if (error.status === 401 && authParams.refresh_token) {
          log.log('Trying to refresh token', error);
          return this.refreshToken();
        }
        throw error;
      })
      .catch((err: CustomError) => {
        if (err.error === 'banned_user') {
          err.error_description = ERROR_MESSAGE_DATA.USER_BANNED.title;
        }
        log.log('Error during token validation', err);
        throw err;
      });
  }

  async cacheAuthParams(authParams: AuthParams, key?: string): Promise<AuthParams> {
    await storeAuthParams(authParams, key);
    return authParams;
  }

  async getCachedAuthParams(): Promise<AuthParams> {
    const authParams: ?AuthParams = await getStoredAuthParams();
    if (!authParams) {
      throw new Error('No stored auth params found');
    }
    return authParams;
  }
}
