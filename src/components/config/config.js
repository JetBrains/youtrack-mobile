import {AsyncStorage} from 'react-native';

const DEFAULT_BACKEND = 'https://youtrack.jetbrains.com';
const BACKEND_URL_STORAGE_KEY = 'yt_mobile_backend_url';

const config = {
  backendUrl: DEFAULT_BACKEND,
  auth: {
    serverUri: null,
    clientId: null,
    clientSecret: null,
    scopes: 'Hub YouTrack',
    landingUrl: 'ytoauth://landing.url'
  }
};

function storeBackendUrl(url) {
  return AsyncStorage.setItem(BACKEND_URL_STORAGE_KEY, url)
    .then(() => url);
}

function getStoredBackendURL() {
  return AsyncStorage.getItem(BACKEND_URL_STORAGE_KEY)
    .then(res => res || DEFAULT_BACKEND);
}

function handleEmbeddedHubUrl(hubUrl, ytUrl) {
  return hubUrl[0] === '/' ? ytUrl + hubUrl : hubUrl;
}

function loadConfig(ytUrl = config.backendUrl) {
  return fetch(`${ytUrl}/api/config?fields=ring(url),mobile(serviceSecret,serviceId)`)
    .then(res => res.json())
    .then(res => {
      if (!res.mobile.serviceId) {
        throw new Error(`${ytUrl} does not have mobile application feature turned on. Check the documentation.`);
      }

      storeBackendUrl(ytUrl);

      config.backendUrl = ytUrl;

      Object.assign(config.auth, {
        serverUri: handleEmbeddedHubUrl(res.ring.url, ytUrl),
        clientId: res.mobile.serviceId,
        clientSecret: res.mobile.serviceSecret
      });

      return config;
    });
}

export {loadConfig, getStoredBackendURL};
