import {Linking} from 'react-native';
import urlJoin from 'url-join';
import qs from 'qs';
import type {AppConfig} from '../../flow/AppConfig';

function openAuthPage(config: AppConfig) {
  Linking.openURL(encodeURI(urlJoin(
    config.auth.serverUri,
    '/api/rest/oauth2/auth',
    '?response_type=code',
    '&access_type=offline',
    `&client_id=${config.auth.clientId}`,
    `&scope=${config.auth.scopes}`,
    `&redirect_uri=${config.auth.landingUrl}`
  )));
}

function authorizeInHub(config: AppConfig) {
  return new Promise(function (resolve) {

    function onOpenWithUrl(event) {
      Linking.removeEventListener('url', onOpenWithUrl);
      const url = event.url || event;

      const [, query_string] = url.match(/\?(.*)/);
      const code = qs.parse(query_string).code;
      resolve(code);
      Linking.removeEventListener('url', onOpenWithUrl);
    }

    Linking.addEventListener('url', onOpenWithUrl);

    openAuthPage(config);
  });
}

export default authorizeInHub;
