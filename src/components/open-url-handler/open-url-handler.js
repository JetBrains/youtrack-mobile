/* @flow */
import {DeviceEventEmitter, Linking} from 'react-native';
import qs from 'qs';
import log from '../log/log';

const issueIdReg = /issue(Mobile)?\/([\w-\d]+)/;

export function isOneOfServers(url: string, serverURLs: Array<string>) {
  return serverURLs.some(serverURL => url.indexOf(serverURL) !== -1);
}

export function extractId(issueUrl: ?string) {
  if (issueUrl) {
    const match = decodeURIComponent(issueUrl).match(issueIdReg);
    return match && match[2];
  }
  return null;
}

function extractIssuesQuery(issuesUrl: ?string) {
  if (!issuesUrl) {
    return null;
  }
  const match = issuesUrl.match(/\?(.*)/);
  if (!match || !match[1]) {
    log.warn(`Cannot extract query string from "${issuesUrl}"`);
    return null;
  }

  const queryString: string = match[1];
  const query = qs.parse(queryString).q;
  log.info(`extractIssuesQuery: ${query} :: from URL: "${issuesUrl}"`);
  return query;
}

function parseUrl(url, onIssueIdDetected, onQueryDetected) {
  const id = extractId(url);
  if (id) {
    log.info(`Issue ID detected in URL: ${id}`);
    return onIssueIdDetected(url, id);
  } else {
    log.info(`(parseUrl): cannot extract issue id from ${url}`);
  }

  const query = extractIssuesQuery(url);
  if (query) {
    log.info(`Issues query detected in open URL: ${query}`);
    return onQueryDetected(url, query);
  }

  DeviceEventEmitter.emit('openWithUrl', decodeURIComponent(url));
}

export default function openByUrlDetector(
  onIssueIdDetected: (url: ?string, issueId: string) => any,
  onQueryDetected: (url: ?string, query: string) => any
) {
  Linking.getInitialURL().then((url: ?string) => {
    log.debug(`App has been initially started with URL "${url || 'NOPE'}"`);
    if (!url) {
      return;
    }

    return parseUrl(url, onIssueIdDetected, onQueryDetected);
  });

  function onOpenWithUrl(event) {
    const url = event.url || event;
    log.debug(`Linking URL event fired with URL "${url}"`);

    return parseUrl(url, onIssueIdDetected, onQueryDetected);
  }

  Linking.addEventListener('url', onOpenWithUrl);

  return function unsubscribe() {
    Linking.removeEventListener('url', onOpenWithUrl);
  };
}
