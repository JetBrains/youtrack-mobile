import config from '../../app__config';
import {LinkingIOS} from 'react-native';
import openUrl from '../open-url/open-url.ios';

import shittyQs from 'shitty-qs';

function openAuthPage() {
    openUrl([
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
