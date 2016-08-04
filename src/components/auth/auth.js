import {AsyncStorage} from 'react-native';
import Permissions from './auth__permissions';
import base64 from 'base64-js';
import qs from 'qs';

const STORAGE_KEY = 'yt_mobile_auth';

const ACCEPT_HEADER = 'application/json, text/plain, */*';

function makeBtoa(str) {
  let byteArray = [];
  for (let i = 0; i < str.length; i++) {
    byteArray.push(str.charCodeAt(i));
  }
  return base64.fromByteArray(byteArray);
}

export default class Auth {
  constructor(config) {
    this.authParams = null;
    this.config = config;
    this.CHECK_TOKEN_URL = `${this.config.auth.serverUri}/api/rest/users/me?fields=id,guest,name,profile/avatar/url`;

    const permissionsQueryString = qs.stringify({
      query: `service:{0-0-0-0-0} or service:{${config.auth.youtrackServiceId}}`,
      fields: 'permission/key,global,projects(id)'
    });
    this.PERMISSIONS_CACHE_URL = `${this.config.auth.serverUri}/api/rest/permissions/cache?${permissionsQueryString}`;
  }

  authorizeOAuth(code) {
    return this.obtainToken(code)
      .then(this.storeAuth.bind(this));
  }

  authorizeCredentials(login, pass) {
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

  // TODO(maksimrv): Remove duplication
  // in obtainToken and obtainTokenByCredentials
  obtainToken(code) {
    console.info('Obtaining token for code', code, this.config.auth.serverUri);

    const config = this.config;

    return fetch([
      config.auth.serverUri,
      `/api/rest/oauth2/token`,
      '?grant_type=authorization_code',
      `&code=${code}`,
      `&client_id=${config.auth.clientId}`,
      `&client_secret=${config.auth.clientSecret}`,
      `&redirect_uri=${config.auth.landingUrl}`
    ].join(''), {
      method: 'POST',
      headers: {
        'Accept': ACCEPT_HEADER,
        'Authorization': `Basic ${makeBtoa(`${config.auth.clientId}:${config.auth.clientSecret}`)}`
      }
    }).then(res => res.json())
      .then(res => {
        if (res.error) {
          throw res;
        }
        return res;
      });
  }

  obtainTokenByCredentials(login, password) {
    const config = this.config;
    const hubUrl = `${config.auth.serverUri}/api/rest/oauth2/token`;

    console.info(`Obtaining token by credentials on ${hubUrl} for "${login}"`);

    return fetch(hubUrl, {
      method: 'POST',
      headers: {
        'Accept': ACCEPT_HEADER,
        'Authorization': `Basic ${makeBtoa(`${config.auth.clientId}:${config.auth.clientSecret}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: [
        'grant_type=password',
        '&access_type=offline',
        `&username=${login}`,
        `&password=${password}`,
        `&scope=${config.auth.scopes}`
      ].join('')
    }).then(res => res.json())
      .then(res => {
        if (res.error) {
          throw res;
        }
        return res;
      });
  }

  refreshToken() {
    let token;
    return this.readAuth()
      .then(authParams => {
        console.info('Begining token refresh', authParams);

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
            'Authorization': `Basic ${makeBtoa(`${config.auth.clientId}:${config.auth.clientSecret}`)}`
          }
        })
      })
      .then(res => res.json())
      .then((authParams) => {
        if (!authParams.error_code) {
          console.info('Token has been refreshed', authParams);
          //restore old refresh token
          authParams.refresh_token = authParams.refresh_token || token;
        } else {
          console.warn('Token refreshing failed', authParams);
          throw authParams;
        }
        return authParams;
      })
      .then((authParams) => this.verifyToken(authParams))
      .then((authParams) => this.loadPermissions(authParams))
      .then(this.storeAuth.bind(this))
      .then((authParams) => this.authParams = authParams);
  }

  /**
   * Not sure that check is still required.
   */
  verifyToken(authParams) {
    console.info('Verifying token...');

    return fetch(this.CHECK_TOKEN_URL, {
      headers: {
        'Accept': ACCEPT_HEADER,
        'Authorization': `${authParams.token_type} ${authParams.access_token}`
      }
    }).then((res) => {
      if (res.status > 400) {
        console.log('Check token error', res);
        throw res;
      }
      console.info('Token has been verified');
      return res.json();
    })
      .then(currentUser => {
        this.currentUser = currentUser;
        return authParams;
      })
      .catch((res) => {
        if (res.status === 401 && authParams.refresh_token) {
          console.log('Trying to refresh token', res);
          return this.refreshToken();
        }
        throw res;
      })
      .catch((err) => {
        console.log('Error during token validation', err);
        throw err;
      });
  }

  loadPermissions(authParams) {
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
        console.log('Cant load permissions', err);
        throw err;
      });
  }

  storeAuth(authParams) {
    return AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(authParams))
      .then(() => authParams);
  }

  readAuth() {
    return AsyncStorage.getItem(STORAGE_KEY)
      .then((authParamsString) => JSON.parse(authParamsString));
  }
}
