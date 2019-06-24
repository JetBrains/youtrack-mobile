/* @flow */
import urlJoin from 'url-join';
import Permissions from './auth__permissions';
import {getStorageState, flushStoragePart} from '../storage/storage';
import base64 from 'base64-js';
import qs from 'qs';
import log from '../log/log';
import {USER_AGENT} from '../usage/usage';
import type {AppConfigFilled} from '../../flow/AppConfig';

const ACCEPT_HEADER = 'application/json, text/plain, */*';
const URL_ENCODED_TYPE = 'application/x-www-form-urlencoded';

function makeBtoa(str: string) {
  const byteArray = [];
  for (let i = 0; i < str.length; i++) {
    byteArray.push(str.charCodeAt(i));
  }
  return base64.fromByteArray(byteArray);
}

export type AuthParams = {
  refresh_token: string;
  access_token: string,
  token_type: string,
  error_code?: string
};

export type CurrentUser = {
  id: string,
  guest: boolean,
  name: string,
  profile?: {
    avatar?: {
      url?: string
    }
  },
  endUserAgreementConsent?: {
    accepted: boolean,
    majorVersion: string,
    minorVersion: string
  }
};

export default class AuthTest {
  config: AppConfigFilled;
  authParams: ?AuthParams;
  permissions: Permissions;
  currentUser: CurrentUser;
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
    return this.readAuth()
      .then((authParams: AuthParams) => {
        log.info('Begining token refresh...');

        const config = this.config;

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
      .then((authParams: AuthParams) => {
        if (!authParams.error_code) {
          log.info('Token has been refreshed.');
          //restore old refresh token
          authParams.refresh_token = authParams.refresh_token || token;
        } else {
          log.warn('Token refreshing failed', authParams);
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

  getAuthorizationHeaders(authParams: ?AuthParams = this.authParams): {Authorization: string} {
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

  loadPermissions(authParams: AuthParams): Promise<AuthParams> {
    return fetch(this.PERMISSIONS_CACHE_URL, {
      headers: {
        'Accept': ACCEPT_HEADER,
        'User-Agent': USER_AGENT,
        'Authorization': `${authParams.token_type} ${authParams.access_token}`
      }
    })
      .then((res) => res.json())
      .then((res) => {
        log.info('Permissions loaded', res);
        this.permissions = new Permissions(res);
        return authParams;
      })
      .catch(err => {
        log.log('Cant load permissions', err);
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
