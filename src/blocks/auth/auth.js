var oauth = require('./auth__oauth');
var config = require('../app/app__config');
var AsyncStorage = require('react-native').AsyncStorage;
const STORAGE_KEY = 'yt_mobile_auth';

const CHECK_TOKEN_URL = config.auth.serverUri + '/api/rest/users/me?fields=id';

class Auth {
    constructor() {
        this.authParams = null;
    }

    authorize() {
        return oauth();
    }

    authorizeAndStoreToken() {
        return this.authorize()
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

    refreshToken() {
        return this.readAuth()
            .then(authParams => {
                return fetch([
                    config.auth.serverUri,
                    `/api/rest/oauth2/token`,
                    '?grant_type=refresh_token',
                    `&refresh_token=${authParams.refresh_token}`
                ].join(''), {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json, text/plain, */*'
                    }
                })
            })
            .then(res => res.json())
            .catch(err => {throw err})
            .then((authParams) => {
                console.info('Token has been refreshed', authParams);
                return authParams;
            })
            .then((authParams) => this.verifyToken(authParams))
            .then(this.storeAuth.bind(this))
            .then((authParams) => this.authParams = authParams);
    }

    /**
     * Not sure that check is still required.
    */
    verifyToken(authParams) {
        if (!authParams || !authParams.access_token) {
            return this.authorizeAndStoreToken();
        }

        return fetch(CHECK_TOKEN_URL, {
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Authorization': `${authParams.token_type} ${authParams.access_token}`
            }
        }).then((res) => {
            if (res.status > 400) {
                console.warn('Check token error', res);
                throw res;
            }
            return authParams;
        })
            .catch((res) => {
                if (res.status === 401) {
                    return this.refreshToken();
                }
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