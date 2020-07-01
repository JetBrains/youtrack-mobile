/* @flow */

import urlJoin from 'url-join';
import Permissions from './auth__permissions';
import {flushStoragePart, getStorageState} from '../storage/storage';
import base64 from 'base64-js';
import qs from 'qs';
import log from '../log/log';
import {USER_AGENT} from '../usage/usage';
import {createExtendedErrorMessage, reportError} from '../error/error-reporter';
import {notify} from '../notification/notification';

import type {AppConfigFilled} from '../../flow/AppConfig';
import type {AuthParams} from '../../flow/Auth';
import type {User} from '../../flow/User';

const ACCEPT_HEADER = 'application/json, text/plain, */*';
const URL_ENCODED_TYPE = 'application/x-www-form-urlencoded';


function makeBtoa(str: string) {
  const byteArray = [];
  for (let i = 0; i < str.length; i++) {
    byteArray.push(str.charCodeAt(i));
  }
  return base64.fromByteArray(byteArray);
}

export default class AuthTest {
  config: AppConfigFilled;
  authParams: ?AuthParams;
  permissions: Permissions;
  currentUser: User;
  CHECK_TOKEN_URL: string;
  PERMISSIONS_CACHE_URL: string;

  constructor(config: AppConfigFilled) {
    this.authParams = null;
    this.config = config;
    this.CHECK_TOKEN_URL = urlJoin(this.config.auth.serverUri, '/api/rest/users/me?fields=id,guest,name,profile/avatar/url,endUserAgreementConsent(accepted,majorVersion,minorVersion)');

    const permissionsQueryString = qs.stringify({
      query: `service:{0-0-0-0-0} or service:{${config.auth.youtrackServiceId}}`,
      fields: 'permission/key,global,projects(id)'
    });
    this.PERMISSIONS_CACHE_URL = urlJoin(this.config.auth.serverUri, `/api/rest/permissions/cache?${permissionsQueryString}`);
  }

  loadStoredAuthParams(): Promise<void> {
    return this.readAuth()
      .then((authParams) => this.verifyToken(authParams))
      .then((authParams) => {
        this.authParams = authParams;
      });
  }

  async logOut() {
    await flushStoragePart({authParams: null});
    delete this.authParams;
  }

  obtainToken(body: string) {
    const config = this.config;
    const hubTokenUrl = urlJoin(config.auth.serverUri, '/api/rest/oauth2/token');

    return fetch(hubTokenUrl, {
      method: 'POST',
      headers: {
        'Accept': ACCEPT_HEADER,
        'User-Agent': USER_AGENT,
        'Authorization': `Basic ${makeBtoa(`${config.auth.clientId}:${config.auth.clientSecret}`)}`,
        'Content-Type': URL_ENCODED_TYPE
      },
      body: body
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

  obtainTokenByOAuthCode(code: string) {
    log.info('Obtaining token for code', code, this.config.auth.serverUri);

    return this.obtainToken([
      'grant_type=authorization_code',
      `&code=${code}`,
      `&client_id=${this.config.auth.clientId}`,
      `&client_secret=${this.config.auth.clientSecret}`,
      `&redirect_uri=${this.config.auth.landingUrl}`
    ].join(''));
  }

  obtainTokenByCredentials(login: string, password: string) {
    log.info(`Obtaining token by credentials on ${this.config.auth.serverUri} for "${login}"`);

    return this.obtainToken([
      'grant_type=password',
      '&access_type=offline',
      `&username=${encodeURIComponent(login)}`,
      `&password=${encodeURIComponent(password)}`,
      `&scope=${encodeURIComponent(this.config.auth.scopes)}`
    ].join(''));
  }

  refreshToken(): Promise<AuthParams> {
    let token;
    const config = this.config;

    return this.readAuth()
      .then((authParams: AuthParams) => {
        log.info('Begining token refresh...');

        //store old refresh token
        token = authParams.refresh_token;

        return fetch(urlJoin(
          config.auth.serverUri,
          `/api/rest/oauth2/token`,
          '?grant_type=refresh_token',
          `&refresh_token=${authParams.refresh_token}`
        ), {
          method: 'POST',
          headers: {
            'Accept': ACCEPT_HEADER,
            'User-Agent': USER_AGENT,
            'Authorization': `Basic ${makeBtoa(`${config.auth.clientId}:${config.auth.clientSecret}`)}`,
            'Content-Type': URL_ENCODED_TYPE
          }
        });
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
      .then((authParams) => this.verifyToken(authParams))
      .then((authParams) => this.storeAuth(authParams))
      .then((authParams) => {
        this.authParams = authParams;
        return authParams;
      });
  }

  getAuthorizationHeaders(authParams: ?AuthParams = this.authParams): { Authorization: string } {
    if (!authParams) {
      throw new Error('Auth: getAuthorizationHeaders called before authParams initialization');
    }
    return {
      'Authorization': `${authParams.token_type} ${authParams.access_token}`,
      'User-Agent': USER_AGENT
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
        ...this.getAuthorizationHeaders(authParams)
      }
    }).then((res) => {
      if (res.status > 400) {
        const errorTitle: string = 'Check token error';
        log.log(errorTitle, res);
        throw res;
      }
      log.info('Token has been verified');
      return res.json();
    })
      .then(currentUser => {
        this.currentUser = currentUser;
        return authParams;
      })
      .catch((res) => {
        if (res.status === 401 && authParams.refresh_token) {
          log.log('Trying to refresh token', res);
          return this.refreshToken();
        }
        throw res;
      })
      .catch((err) => {
        log.log('Error during token validation', err);
        throw err;
      });
  }

  getPermissionCache(authParams: AuthParams) {
    return fetch(this.PERMISSIONS_CACHE_URL, {
      headers: {
        'Accept': ACCEPT_HEADER,
        'User-Agent': USER_AGENT,
        'Authorization': `${authParams?.token_type} ${authParams?.access_token}`
      }
    });
  }

  loadPermissions(authParams: AuthParams): Promise<AuthParams> {
    const errorMessage: string = 'Failed to load permissions';

    return this.getPermissionCache(authParams)
      .then((res) => res.json())
      .then((res) => {
        log.info('Permissions loaded', res);

        if (!res) {
          log.warn(errorMessage, res);
          notify(errorMessage, 7000);
        }

        this.permissions = new Permissions(res);
        return authParams;
      })
      .catch(async err => {
        log.log(errorMessage, err);
        const extendedErrorMessage = await createExtendedErrorMessage(err, this.PERMISSIONS_CACHE_URL, 'GET');
        reportError(extendedErrorMessage, errorMessage);
        throw err;
      });
  }

  async storeAuth(authParams: AuthParams) {
    await flushStoragePart({authParams});
    return authParams;
  }

  async readAuth(): Promise<AuthParams> {
    const authParams: ?AuthParams = getStorageState().authParams;
    if (!authParams) {
      throw new Error('No stored auth params found');
    }
    return authParams;
  }
}
