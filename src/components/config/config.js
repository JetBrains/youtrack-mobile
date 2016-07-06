// @flow
import {AsyncStorage} from 'react-native';

const DEFAULT_BACKEND = 'https://youtrack.jetbrains.com';
const BACKEND_URL_STORAGE_KEY = 'yt_mobile_backend_url';

type ConfigAuth = {
  serverUri: ?string,
  clientId: ?string,
  clientSecret: ?string,
  scopes: string,
  landingUrl: string,
  youtrackServiceId: ?string
};

type AppConfig = {backendUrl: string; auth: ConfigAuth};

const config: AppConfig = {
  backendUrl: DEFAULT_BACKEND,
  auth: {
    serverUri: null,
    clientId: null,
    clientSecret: null,
    youtrackServiceId: null,
    scopes: 'Hub YouTrack',
    landingUrl: 'ytoauth://landing.url'
  }
};

function storeBackendUrl(url: string) {
  return AsyncStorage.setItem(BACKEND_URL_STORAGE_KEY, url)
    .then(() => url);
}

function getStoredBackendURL() {
  return AsyncStorage.getItem(BACKEND_URL_STORAGE_KEY)
    .then(res => res || DEFAULT_BACKEND);
}

function handleEmbeddedHubUrl(hubUrl: string, ytUrl: string) {
  return hubUrl[0] === '/' ? ytUrl + hubUrl : hubUrl;
}

function loadConfig(ytUrl: string = config.backendUrl) {
  return fetch(`${ytUrl}/api/config?fields=ring(url,serviceId),mobile(serviceSecret,serviceId)`)
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
