import {Linking} from 'react-native';

import qs from 'qs';

function openAuthPage(config) {
  Linking.openURL([
    `${config.auth.serverUri}/api/rest/oauth2/auth`,
    '?response_type=code',
    '&access_type=offline',
    `&client_id=${config.auth.clientId}`,
    `&scope=${config.auth.scopes}`,
    `&redirect_uri=${config.auth.landingUrl}`
  ].join(''));
}

function hubOAuth2(config) {
  return new Promise(function (resolve) {

    function onOpenWithUrl(event) {
      Linking.removeEventListener('url', onOpenWithUrl);

      let [, query_string] = event.url.match(/\?(.*)/);
      const code = qs.parse(query_string).code;
      resolve(code);
    }

    Linking.addEventListener('url', onOpenWithUrl);

    openAuthPage(config);
  });
}

module.exports = {
  checkIfBeingAuthorizing: () => {
    return Promise.reject(new Error('INFO: Initial URL authorization doesn\'t used in ios'));
  },
  authorizeInHub: hubOAuth2
};
