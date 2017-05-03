/* @flow */
import {AsyncStorage} from 'react-native';
import Permissions from './auth__permissions';
import base64 from 'base64-js';
import qs from 'qs';
import log from '../log/log';
import type {AppConfigFilled} from '../../flow/AppConfig';

const STORAGE_KEY = 'yt_mobile_auth';

const ACCEPT_HEADER = 'application/json, text/plain, */*';
const URL_ENCODED_TYPE = 'application/x-www-form-urlencoded';

function makeBtoa(str: string) {
  const byteArray = [];
  for (let i = 0; i < str.length; i++) {
    byteArray.push(str.charCodeAt(i));
  }
  return base64.fromByteArray(byteArray);
}

declare type AuthParams = {refresh_token: string; access_token: string, token_type: string};

export default class Auth {
  config: AppConfigFilled;
  authParams: ?AuthParams;
  permissions: Permissions;
  currentUser: Object;
  CHECK_TOKEN_URL: string;
  PERMISSIONS_CACHE_URL: string;

  constructor(config: AppConfigFilled) {
    this.authParams = null;
    this.config = config;
    this.CHECK_TOKEN_URL = `${this.config.auth.serverUri}/api/rest/users/me?fields=id,guest,name,profile/avatar/url`;

    const permissionsQueryString = qs.stringify({
      query: `service:{0-0-0-0-0} or service:{${config.auth.youtrackServiceId}}`,
      fields: 'permission/key,global,projects(id)'
    });
    this.PERMISSIONS_CACHE_URL = `${this.config.auth.serverUri}/api/rest/permissions/cache?${permissionsQueryString}`;
  }

  authorizeOAuth(code: string) {
    return this.obtainTokenByOAuthCode(code)
      .then(this.storeAuth.bind(this));
  }

  authorizeCredentials(login: string, pass: string) {
    return this.obtainTokenByCredentials(login, pass)
      .then(this.storeAuth.bind(this));
  }

  loadStoredAuthParams() {
    return this.readAuth()
      .then((authParams) => this.verifyToken(authParams))
      .then((authParams) => this.loadPermissions(authParams))
      .then((authParams) => this.authParams = authParams);
  }

  logOut() {
    return AsyncStorage.removeItem(STORAGE_KEY).then(() => delete this.authParams);
  }

  obtainToken(body: string) {
    const config = this.config;
    const hubTokenUrl = `${config.auth.serverUri}/api/rest/oauth2/token`;

    return fetch(hubTokenUrl, {
      method: 'POST',
      headers: {
        'Accept': ACCEPT_HEADER,
        'Authorization': `Basic ${makeBtoa(`${config.auth.clientId}:${config.auth.clientSecret}`)}`,
        'Content-Type': URL_ENCODED_TYPE
      },
      body: body
    }).then(res => res.json())
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
      `&scope=${this.config.auth.scopes}`
    ].join(''));
  }

  refreshToken() {
    let token;
    return this.readAuth()
      .then((authParams: AuthParams) => {
        log.info('Begining token refresh', authParams);

        const config = this.config;

        //store old refresh token
        token = authParams.refresh_token;

        return fetch([
          config.auth.serverUri,
          `/api/rest/oauth2/token`,
          '?grant_type=refresh_token',
          `&refresh_token=${authParams.refresh_token}`
        ].join(''), {
          method: 'POST',
          headers: {
            'Accept': ACCEPT_HEADER,
            'Authorization': `Basic ${makeBtoa(`${config.auth.clientId}:${config.auth.clientSecret}`)}`,
            'Content-Type': URL_ENCODED_TYPE
          }
        });
      })
      .then(res => res.json())
      .then((authParams: AuthParams) => {
        if (!authParams.error_code) {
          log.info('Token has been refreshed', authParams);
          //restore old refresh token
          authParams.refresh_token = authParams.refresh_token || token;
        } else {
          log.warn('Token refreshing failed', authParams);
          throw authParams;
        }
        return authParams;
      })
      .then((authParams) => this.verifyToken(authParams))
      .then((authParams) => this.loadPermissions(authParams))
      .then(this.storeAuth.bind(this))
      .then((authParams) => this.authParams = authParams);
  }

  getAuthorizationHeaders(authParams: ?AuthParams = this.authParams): {Authorization: string} {
    if (!authParams) {
      throw new Error('Auth: getAuthorizationHeaders called before authParams initialization');
    }
    return {
      'Authorization': `${authParams.token_type} ${authParams.access_token}`
    };
  }

  /**
   * Not sure that check is still required.
   */
  verifyToken(authParams: AuthParams) {
    log.info('Verifying token...');

    return fetch(this.CHECK_TOKEN_URL, {
      headers: {
        'Accept': ACCEPT_HEADER,
        ...this.getAuthorizationHeaders(authParams)
      }
    }).then((res) => {
      if (res.status > 400) {
        log.log('Check token error', res);
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

  loadPermissions(authParams: AuthParams) {
    return fetch(this.PERMISSIONS_CACHE_URL, {
      headers: {
        'Accept': ACCEPT_HEADER,
        'Authorization': `${authParams.token_type} ${authParams.access_token}`
      }
    })
      .then((res) => res.json())
      .then((res) => {
        this.permissions = new Permissions(res);
        return authParams;
      })
      .catch(err => {
        log.log('Cant load permissions', err);
        throw err;
      });
  }

  storeAuth(authParams: AuthParams) {
    return AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(authParams))
      .then(() => authParams);
  }

  readAuth() {
    return AsyncStorage.getItem(STORAGE_KEY)
      .then((authParamsString: string) => JSON.parse(authParamsString));
  }
}
