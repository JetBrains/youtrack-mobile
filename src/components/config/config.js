/* @flow */

import UrlParse from 'url-parse';
import {USER_AGENT} from '../usage/usage';
import log from '../log/log';
import {YT_SUPPORTED_VERSION} from '../error-message/error-text-messages';

import type {AppConfig} from 'flow/AppConfig';
import type {CustomError} from '../../flow/Error';

const MIN_YT_VERSION = 7.0;
const PROTOCOL_REGEXP = /^https?:\/\//i;
const YOUTRACK_CONTEXT_REGEXP = /\/youtrack$/i;
const VERSION_DETECT_FALLBACK_URL = '/rest/workflow/version';


export function getDefaultConfig(): AppConfig {
  return {
    backendUrl: '',
    statisticsEnabled: false,
    version: '0.0.0-dev',
    auth: {
      serverUri: null,
      clientId: null,
      clientSecret: null,
      youtrackServiceId: null,
      scopes: 'Hub YouTrack',
      landingUrl: 'ytoauth://landing.url',
    },
  };
}

class IncompatibleYouTrackError extends Error {
  isIncompatibleYouTrackError = true;
}

function handleIncompatibleYouTrack(response: CustomError, ytUrl: string) {
  ytUrl = ytUrl.replace(VERSION_DETECT_FALLBACK_URL, '');

  //Handle very old (6.5 and below) instances
  if (response.error === 'Not Found') {
    throw new IncompatibleYouTrackError(`Cannot connect to ${ytUrl} - this version of YouTrack is not supported. ${YT_SUPPORTED_VERSION}`);
  }

  //Handle config load error
  if (response.error_developer_message) {
    throw new IncompatibleYouTrackError(`Unable to connect to this YouTrack instance. ${YT_SUPPORTED_VERSION} ${response.error_developer_message}`);
  }

  if (parseFloat(response.version) < MIN_YT_VERSION) {
    throw new IncompatibleYouTrackError(`${YT_SUPPORTED_VERSION} ${ytUrl} has version ${response.version}.`);
  }

  if (!response.mobile || !response.mobile.serviceId) {
    throw new IncompatibleYouTrackError(`The mobile application feature is not enabled for ${ytUrl}. Please contact support.`);
  }
}

export function getBaseUrl(url: string): any | string {
  if (!url) {
    return url;
  }
  return UrlParse(url).origin;
}

function handleRelativeUrl(hubUrl: string | null = null, ytUrl: string): null | string {
  ytUrl = getBaseUrl(ytUrl);
  return hubUrl && hubUrl[0] && hubUrl[0] === '/' ? ytUrl + hubUrl : hubUrl;
}

function formatYouTrackURL(url: string): string {
  return url.replace(PROTOCOL_REGEXP, '').replace(YOUTRACK_CONTEXT_REGEXP, '');
}

async function loadConfig(ytUrl: string): Promise<any> {
  const url: string = `${ytUrl}/api/config?fields=ring(url,serviceId),mobile(serviceSecret,serviceId),version,build,statisticsEnabled,l10n(language,locale)`;
  return fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': 'application/json, text/plain, */*',
    },
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
      config.l10n = res.l10n;

      Object.assign(config.auth, {
        serverUri: handleRelativeUrl(res.ring.url, ytUrl),
        youtrackServiceId: res.ring.serviceId,
        clientId: res.mobile.serviceId,
        clientSecret: res.mobile.serviceSecret,
      });

      return config;
    })
    .catch((err: Error) => {
      log.log(`Failed to load config: ${err && err.toString && err.toString()}`);
      // Catches "Unexpected token < in JSON at position 0" error
      const isSyntaxError: boolean = err instanceof SyntaxError;

      if (isSyntaxError) {
        throw new Error(`Invalid server response. The URL is either an unsupported YouTrack version or is not a YouTrack instance. ${YT_SUPPORTED_VERSION}`);
      }

      return Promise.reject(err);
    });
}

export {loadConfig, formatYouTrackURL, handleRelativeUrl, VERSION_DETECT_FALLBACK_URL};
