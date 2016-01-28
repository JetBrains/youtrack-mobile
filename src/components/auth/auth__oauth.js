import config from '../app/app__config';
import {LinkingIOS} from 'react-native';
import shittyQs from 'shitty-qs';

function openAuthPage() {
    LinkingIOS.openURL([
        `${config.auth.serverUri}/auth/login`,
        '?response_type=code',
        '&access_type=offline',
        `&client_id=${config.auth.clientId}`,
        `&scope=${config.auth.scopes}`,
        `&redirect_uri=${config.auth.landingUrl}`
    ].join(''));
}

function hubOAuth2() {
    return new Promise(function (resolve, reject) {

        LinkingIOS.addEventListener('url', function (event) {
            let [, query_string] = event.url.match(/\?(.*)/);
            let code = shittyQs(query_string).code;
            resolve(code);
        });

        openAuthPage();
    });
}

module.exports = hubOAuth2;
