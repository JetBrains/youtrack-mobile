import {Linking} from 'react-native';
import SafariView from 'react-native-safari-view';
import {COLOR_PINK as tintColor} from '../variables/variables';
import qs from 'qs';

async function openAuthPage(config) {
  const url =  encodeURI([
    `${config.auth.serverUri}/api/rest/oauth2/auth`,
    '?response_type=code',
    '&access_type=offline',
    `&client_id=${config.auth.clientId}`,
    `&scope=${config.auth.scopes}`,
    `&redirect_uri=${config.auth.landingUrl}`
  ].join(''));

  try {
    await SafariView.isAvailable();
  } catch (e) {
    Linking.openURL(url);
  }

  SafariView.show({url, tintColor});
}

function authorizeInHub(config) {
  return new Promise(function (resolve) {

    function onOpenWithUrl(event) {
      Linking.removeEventListener('url', onOpenWithUrl);
      SafariView.dismiss();

      const url = event.url || event;

      const [, query_string] = url.match(/\?(.*)/);
      const code = qs.parse(query_string).code;
      resolve(code);
    }

    Linking.addEventListener('url', onOpenWithUrl);

    openAuthPage(config);
  });
}

export default authorizeInHub;
