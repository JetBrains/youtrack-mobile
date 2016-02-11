import hubOAuth2 from './auth__oauth';
import config from '../../app__config';
import {AsyncStorage} from 'react-native';
import base64 from 'base64-js';

const STORAGE_KEY = 'yt_mobile_auth';

const CHECK_TOKEN_URL = `${config.auth.serverUri}/api/rest/users/me?fields=id`;

function makeBtoa(str) {
    let byteArray = [];
    for (let i = 0; i < str.length; i++) {
        byteArray.push(str.charCodeAt(i));
    }
    return base64.fromByteArray(byteArray);
}

class Auth {
    constructor() {
        this.authParams = null;
    }

    authorizeOAuth() {
        return hubOAuth2()
            .then(code => this.obtainToken(code))
            .then(this.storeAuth.bind(this));
    }

    authorizeCredentials(login, pass) {
        return this.obtainTokenByCredentials(login, pass)
            .then(this.storeAuth.bind(this));
    }

    loadStoredAuthParams() {
        return this.readAuth()
            .then((authParams) => this.verifyToken(authParams))
            .then((authParams) => this.authParams = authParams);
    }

    logOut() {
        return AsyncStorage.removeItem(STORAGE_KEY).then(() => delete this.authParams);
    }

    // TODO(maksimrv): Remove duplication
    // in obtainToken and obtainTokenByCredentials
    obtainToken(code) {
        console.info('Obtaining token for code', code);
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
                'Accept': 'application/json, text/plain, */*',
                'Authorization': `Basic ${makeBtoa(`${config.auth.clientId}:${config.auth.clientSecret}`)}`
            }
        }).then(res => res.json())
            .catch(err => {
                throw err;
            });
    }

    obtainTokenByCredentials(login, password) {
        console.info('Obtaining token by credentials for user', login);

        return fetch([
            config.auth.serverUri,
            `/api/rest/oauth2/token`
        ].join(''), {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Authorization': `Basic ${makeBtoa(`${config.auth.clientId}:${config.auth.clientSecret}`)}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: [
                'grant_type=password',
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
                        'Accept': 'application/json, text/plain, */*',
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
                    console.log('Token refreshing failed', authParams);
                    throw authParams;
                }
                return authParams;
            })
            .catch(err => {
                throw err
            })
            .then((authParams) => this.verifyToken(authParams))
            .then(this.storeAuth.bind(this))
            .then((authParams) => this.authParams = authParams);
    }

    /**
     * Not sure that check is still required.
     */
    verifyToken(authParams) {
        console.info('Verifying token...');

        return fetch(CHECK_TOKEN_URL, {
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Authorization': `${authParams.token_type} ${authParams.access_token}`
            }
        }).then((res) => {
                if (res.status > 400) {
                    console.log('Check token error', res);
                    throw res;
                }
                console.info('Token has been verified');
                return authParams;
            })
            .catch((res) => {
                if (res.status === 403) {
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

    storeAuth(authParams) {
        return AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(authParams))
            .then(() => authParams);
    }

    readAuth() {
        return AsyncStorage.getItem(STORAGE_KEY)
            .then((authParamsString) => JSON.parse(authParamsString));
    }
}

module.exports = Auth;