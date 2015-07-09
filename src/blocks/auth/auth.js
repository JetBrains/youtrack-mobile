var oauth = require('./auth__oauth');
var AsyncStorage = require('react-native').AsyncStorage;
const STORAGE_KEY = 'yt_mobile_auth';

class Auth {
    constructor() {
        this.authParams = null;

        this.readStoredAuthPromise = this.readAuth()
            .then((authParams) => this.verifyToken(authParams))
            .then((authParams) => {
                return authParams ? authParams : this.authorizeAndStoreToken();
            })
            .then((authParams) => this.authParams = authParams);
    }

    authorize() {
        return oauth();
    }

    authorizeAndStoreToken() {
        return this.authorize()
            .then(this.storeAuth.bind(this));
    }

    verifyToken(authParams) {
        //TODO: verify token in Hub
        return authParams;
    }

    storeAuth(authParams) {
        this.token = authParams.access_token;

        return AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(authParams))
            .then(() => authParams);
    }

    readAuth() {
        return AsyncStorage.getItem(STORAGE_KEY)
            .then((authParamsString) => JSON.parse(authParamsString));
    }
}

module.exports = Auth;