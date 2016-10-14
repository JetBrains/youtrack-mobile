/* @flow */
import {AsyncStorage} from 'react-native';

const MIN_YT_VERSION = 7.0;
const BACKEND_URL_STORAGE_KEY = 'yt_mobile_backend_url';
const BACKEND_CONFIG_STORAGE_KEY = 'BACKEND_CONFIG_STORAGE_KEY';
const baseUrlRegExp = /^(.*)\//;

const config: AppConfig = {
  backendUrl: null,
  statisticsEnabled: null,
  version: null,
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

async function getStoredBackendURL() {
  return AsyncStorage.getItem(BACKEND_URL_STORAGE_KEY);
}

async function storeConfig(config: AppConfigFilled): Promise<AppConfigFilled> {
  return AsyncStorage.setItem(BACKEND_CONFIG_STORAGE_KEY, JSON.stringify(config))
    .then(() => config);}

async function getStoredConfig(): Promise<?AppConfigFilled> {
  const rawConfig: string = await AsyncStorage.getItem(BACKEND_CONFIG_STORAGE_KEY);
  const config = JSON.parse(rawConfig);

  if (config) {
    return config;
  }

  //TODO: code below is fallback for previous installs have backend URL only. Should be removed after a while.
  const fallbackServerURL = await getStoredBackendURL();

  if (fallbackServerURL) {
    return loadConfig(fallbackServerURL)
      .then(config => {
        AsyncStorage.removeItem(BACKEND_URL_STORAGE_KEY);
        return config;
      });
  }

  return null;
}

function handleEmbeddedHubUrl(hubUrl: string, ytUrl: string) {
  ytUrl = getBaseUrl(ytUrl);
  return hubUrl[0] === '/' ? ytUrl + hubUrl : hubUrl;
}

async function loadConfig(ytUrl: string) {
  return fetch(`${ytUrl}/api/config?fields=ring(url,serviceId),mobile(serviceSecret,serviceId),version,statisticsEnabled`)
    .then(res => res.json())
    .then(res => {
      if (parseFloat(res.version) < MIN_YT_VERSION) {
        throw new Error(`YouTrack Mobile requires YouTrack version >= 7.0, but ${ytUrl} has version ${res.version}.`);
      }

      if (!res.mobile.serviceId) {
        throw new Error(`${ytUrl} does not have mobile application feature turned on. Check the documentation.`);
      }

      config.backendUrl = ytUrl;
      config.statisticsEnabled = res.statisticsEnabled;
      config.version = res.version;

      Object.assign(config.auth, {
        serverUri: handleEmbeddedHubUrl(res.ring.url, ytUrl),
        youtrackServiceId: res.ring.serviceId,
        clientId: res.mobile.serviceId,
        clientSecret: res.mobile.serviceSecret
      });

      return config;
    })
    .then(storeConfig);
}

export {loadConfig, getStoredConfig};
