import log from 'components/log/log';
import UrlParse from 'url-parse';
import {USER_AGENT} from 'components/usage/usage';
import {YT_SUPPORTED_VERSION} from 'components/error-message/error-text-messages';

import type {AppConfig} from 'types/AppConfig';
import type {AnyError} from 'types/Error';

const MIN_YT_VERSION = 7.0;
const PROTOCOL_REGEXP = /^https?:\/\//i;
const YOUTRACK_CONTEXT_REGEXP = /\/youtrack$/i;
const VERSION_DETECT_FALLBACK_URL = '/rest/workflow/version';

function handleError(response: AnyError | AppConfig, ytUrl: string) {
  ytUrl = ytUrl.replace(VERSION_DETECT_FALLBACK_URL, '');

  //Handle very old (6.5 and below) instances
  if ('error' in response && response.error === 'Not Found') {
    throw new Error(
      `Cannot connect to ${ytUrl} - this version of YouTrack is not supported. ${YT_SUPPORTED_VERSION}`,
    );
  }

  //Handle config load error
  if ('error_developer_message' in response && response.error_developer_message) {
    throw new Error(
      `Unable to connect to this YouTrack instance. ${YT_SUPPORTED_VERSION} ${response.error_developer_message}`,
    );
  }

  const res = response as AppConfig;
  if (!res?.version || parseFloat(res.version) < MIN_YT_VERSION) {
    throw new Error(YT_SUPPORTED_VERSION);
  }

  if (!res?.mobile?.serviceId) {
    throw new Error(
      `The mobile application feature is not enabled for ${ytUrl}. Please contact support.`,
    );
  }
  return res;
}

export function getBaseUrl(url: string): any | string {
  if (!url) {
    return url;
  }

  return UrlParse(url).origin;
}

function handleRelativeUrl(
  hubUrl: string,
  ytUrl: string,
): string {
  ytUrl = getBaseUrl(ytUrl);
  return hubUrl?.[0] === '/' ? ytUrl + hubUrl : hubUrl;
}

function formatYouTrackURL(url: string): string {
  return url.replace(PROTOCOL_REGEXP, '').replace(YOUTRACK_CONTEXT_REGEXP, '');
}

async function loadConfig(ytUrl: string): Promise<AppConfig> {
  const url: string = `${ytUrl}/api/config?fields=ring(url,serviceId),mobile(serviceSecret,serviceId),version,build,statisticsEnabled,l10n(language,locale,predefinedQueries)`;
  return fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'application/json, text/plain, */*',
    },
  })
    .then(res => {
      if ('status' in res) {
        log.log(`Got result from ${ytUrl}:`, res.status);
      }
      if ('_bodyText' in res) {
        log.log(`Response body:`, res._bodyText);
      }
      return res.json();
    })
    .then(res => handleError(res, ytUrl))
    .then(config => {
      config.backendUrl = ytUrl;
      config.auth = {
        ...config.auth,
        serverUri: handleRelativeUrl(config.ring.url, ytUrl),
        youtrackServiceId: config.ring.serviceId,
        clientId: config.mobile.serviceId,
        clientSecret: config.mobile.serviceSecret,
        scopes: 'Hub YouTrack Konnector',
        landingUrl: 'ytoauth://landing.url',
      };
      return config;
    })
    .catch(err => {
      log.log(
        `Failed to load config: ${err && err.toString && err.toString()}`,
      );
      // Catches "Unexpected token < in JSON at position 0" error
      const isSyntaxError: boolean = err instanceof SyntaxError;

      if (isSyntaxError) {
        throw new Error(
          `Invalid server response. The URL is either an unsupported YouTrack version or is not a YouTrack instance. ${YT_SUPPORTED_VERSION}`,
        );
      }

      return Promise.reject(err);
    });
}

export {
  loadConfig,
  formatYouTrackURL,
  handleRelativeUrl,
  VERSION_DETECT_FALLBACK_URL,
};
