/* @flow */

import {Linking} from 'react-native';
import urlJoin from 'url-join';
import SafariView from '../safari-view/safari-view';

import {isAndroidPlatform, parseUrlQueryString} from '../../util/util';

import type {AppConfig} from '../../flow/AppConfig';

const isIOS: boolean = !isAndroidPlatform();

const SCHEME = 'ytoauth';

function authorizeInHub(config: AppConfig): Promise<string> {
  return new Promise(function (resolve) {
    function onOpenWithUrl(event) {
      Linking.removeEventListener('url', onOpenWithUrl);

      const url = event.url || event;
      const code = parseUrlQueryString(url).code;
      resolve(code);

      Linking.removeEventListener('url', onOpenWithUrl);
    }

    async function openAuthPage(config: AppConfig) {
      const url = encodeURI(urlJoin(
        config.auth.serverUri,
        '/api/rest/oauth2/auth',
        '?response_type=code',
        '&access_type=offline',
        `&client_id=${config.auth.clientId}`,
        `&scope=${config.auth.scopes}`,
        `&redirect_uri=${config.auth.landingUrl}`
      ));

      if (isIOS) {
        SafariView.requestAuth({url, scheme: SCHEME})
         .then(url => onOpenWithUrl(url));
      } else {
        Linking.openURL(url);
      }
    }

    if (!isIOS) {
      Linking.addEventListener('url', onOpenWithUrl);
    }

    openAuthPage(config);
  });
}

export default authorizeInHub;
