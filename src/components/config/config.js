/* @flow */
import UrlParse from 'url-parse';
import {USER_AGENT} from '../usage/usage';
import log from '../log/log';
import type {AppConfig} from '../../flow/AppConfig';

const MIN_YT_VERSION = 7.0;
const PROTOCOL_REGEXP = /^https?:\/\//i;
const YOUTRACK_CONTEXT_REGEXP = /\/youtrack$/i;
const VERSION_DETECT_FALLBACK_URL = '/rest/workflow/version';

export function getDefaultConfig(): AppConfig {
  return {
    backendUrl: null,
    statisticsEnabled: null,
    version: null,
    auth: {
      serverUri: null,
      clientId: null,
      clientSecret: null,
      youtrackServiceId: null,
      scopes: `Hub YouTrack`,
      landingUrl: 'ytoauth://landing.url'
    }
  };
}

class IncompatibleYouTrackError extends Error {
  isIncompatibleYouTrackError = true;
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

export function getBaseUrl(url: string) {
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
      'User-Agent': USER_AGENT,
      'Accept': 'application/json, text/plain, */*'
    }
  })
    .then(res => {
      log.log(`Got result from ${ytUrl}: ${res && res.status}`);
      log.log(`Response body: ${res && res._bodyText}`);
      return res.json();
    })
    .then(res => {
      handleIncompatibleYouTrack(res, ytUrl);

      const config = getDefaultConfig();
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
    .catch(err => {
      log.log(`Loading config failed with an error ${err && err.toString && err.toString()}`);
      // Catches "Unexpected token < in JSON at position 0" error
      if (err instanceof SyntaxError) {
        throw new Error('Invalid server response. The URL is either an unsupported YouTrack version or is not a YouTrack instance. YouTrack Mobile requires YouTrack version 7.0 or later.');
      }
      return Promise.reject(err);
    });
}

export {loadConfig, formatYouTrackURL, handleRelativeUrl, VERSION_DETECT_FALLBACK_URL};
