import config from '../../app__config';
import {Linking} from 'react-native';

import qs from 'qs';

function openAuthPage() {
    Linking.openURL([
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

        function onOpenWithUrl(event) {
            Linking.removeEventListener('url', onOpenWithUrl);

            let [, query_string] = event.url.match(/\?(.*)/);
            const code = qs.parse(query_string).code;
            resolve(code);
        }

        Linking.addEventListener('url', onOpenWithUrl);

        openAuthPage();
    });
}

module.exports = hubOAuth2;
