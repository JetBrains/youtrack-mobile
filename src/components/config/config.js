/* @flow */
import {AsyncStorage} from 'react-native';

const BACKEND_URL_STORAGE_KEY = 'yt_mobile_backend_url';
const baseUrlRegExp = /^(.*)\//;

const config: AppConfig = {
  backendUrl: null,
  statisticsEnabled: null,
  auth: {
    serverUri: null,
    clientId: null,
    clientSecret: null,
    youtrackServiceId: null,
    scopes: 'Hub YouTrack',
    landingUrl: 'ytoauth://landing.url'
  }
};

function getBaseUrl(url: string) {
  if (!url) {
    return url;
  }
  const match = url.match(baseUrlRegExp);
  if (!match || !match[1]) {
    return url;
  }
  return match[1];
}

async function storeBackendUrl(url: string) {
  return AsyncStorage.setItem(BACKEND_URL_STORAGE_KEY, url)
    .then(() => url);
}

async function getStoredBackendURL() {
  return AsyncStorage.getItem(BACKEND_URL_STORAGE_KEY);
}

function handleEmbeddedHubUrl(hubUrl: string, ytUrl: string) {
  ytUrl = getBaseUrl(ytUrl);
  return hubUrl[0] === '/' ? ytUrl + hubUrl : hubUrl;
}

async function loadConfig(ytUrl: string) {
  return fetch(`${ytUrl}/api/config?fields=ring(url,serviceId),mobile(serviceSecret,serviceId),statisticsEnabled`)
    .then(res => res.json())
    .then(res => {
      if (!res.mobile.serviceId) {
        throw new Error(`${ytUrl} does not have mobile application feature turned on. Check the documentation.`);
      }

      storeBackendUrl(ytUrl);

      config.backendUrl = ytUrl;

      Object.assign(config.auth, {
        serverUri: handleEmbeddedHubUrl(res.ring.url, ytUrl),
        youtrackServiceId: res.ring.serviceId,
        clientId: res.mobile.serviceId,
        clientSecret: res.mobile.serviceSecret
      });

      return config;
    });
}

export {loadConfig, getStoredBackendURL};
