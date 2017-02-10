/* @flow */
import {AsyncStorage} from 'react-native';
import UrlParse from 'url-parse';
import type {AppConfig, AppConfigFilled} from '../../flow/AppConfig';

const MIN_YT_VERSION = 7.0;
const BACKEND_URL_STORAGE_KEY = 'yt_mobile_backend_url';
const BACKEND_CONFIG_STORAGE_KEY = 'BACKEND_CONFIG_STORAGE_KEY';
const PROTOCOL_REGEXP = /^https?:\/\//i;
const YOUTRACK_CONTEXT_REGEXP = /\/youtrack$/i;
const VERSION_DETECT_FALLBACK_URL = '/rest/workflow/version';

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

class IncompatibleYouTrackError extends Error {
  isIncompatibleYouTrackError = true;
}

async function getStoredBackendURL() {
  return AsyncStorage.getItem(BACKEND_URL_STORAGE_KEY);
}

async function storeConfig(config: AppConfigFilled): Promise<AppConfigFilled> {
  return AsyncStorage.setItem(BACKEND_CONFIG_STORAGE_KEY, JSON.stringify(config))
    .then(() => config);}

async function getStoredConfig(): Promise<?AppConfigFilled> {
  const rawConfig: string = await AsyncStorage.getItem(BACKEND_CONFIG_STORAGE_KEY);

  if (rawConfig) {
    return JSON.parse(rawConfig);
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

function handleIncompatibleYouTrack(response: Object, ytUrl: string) {
  ytUrl = ytUrl.replace(VERSION_DETECT_FALLBACK_URL, '');

  //Handle very old (6.5 and below) instances
  if (response.error === 'Not Found') {
    throw new IncompatibleYouTrackError(`Cannot connect to ${ytUrl} - this version of YouTrack is not supported. YouTrack Mobile requires version 7.0 or later.`);
  }

  //Handle config load error
  if (response.error_developer_message) {
    throw new IncompatibleYouTrackError(`Unable to connect to this YouTrack instance. Check that your YouTrack version is 7.0 or later. ${response.error_developer_message}`);
  }

  if (parseFloat(response.version) < MIN_YT_VERSION) {
    throw new IncompatibleYouTrackError(`YouTrack Mobile requires YouTrack version 7.0 or later. ${ytUrl} has version ${response.version}.`);
  }

  if (!response.mobile || !response.mobile.serviceId) {
    throw new IncompatibleYouTrackError(`The mobile application feature is not enabled for ${ytUrl}. Please contact support.`);
  }
}

function getBaseUrl(url: string) {
  if (!url) {
    return url;
  }
  return UrlParse(url).origin;
}

function handleRelativeUrl(hubUrl: string, ytUrl: string) {
  ytUrl = getBaseUrl(ytUrl);
  return hubUrl[0] === '/' ? ytUrl + hubUrl : hubUrl;
}

function formatYouTrackURL(url: string) {
  return url.replace(PROTOCOL_REGEXP, '').replace(YOUTRACK_CONTEXT_REGEXP, '');
}

async function loadConfig(ytUrl: string) {
  const url = ytUrl.includes(VERSION_DETECT_FALLBACK_URL) ?
    ytUrl :
    `${ytUrl}/api/config?fields=ring(url,serviceId),mobile(serviceSecret,serviceId),version,statisticsEnabled`;

  return fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json, text/plain, */*'
    }
  })
    .then(res => res.json())
    .then(res => {
      handleIncompatibleYouTrack(res, ytUrl);

      config.backendUrl = ytUrl;
      config.statisticsEnabled = res.statisticsEnabled;
      config.version = res.version;

      Object.assign(config.auth, {
        serverUri: handleRelativeUrl(res.ring.url, ytUrl),
        youtrackServiceId: res.ring.serviceId,
        clientId: res.mobile.serviceId,
        clientSecret: res.mobile.serviceSecret
      });

      return config;
    })
    .then(storeConfig)
    .catch(err => {
      // Catches "Unexpected token < in JSON at position 0" error
      if (err instanceof SyntaxError) {
        throw new Error('Invalid server response. The URL is either an unsupported YouTrack version or is not a YouTrack instance. YouTrack Mobile requires YouTrack version 7.0 or later.');
      }
      return Promise.reject(err);
    });
}

export {loadConfig, getStoredConfig, formatYouTrackURL, handleRelativeUrl, VERSION_DETECT_FALLBACK_URL};
