/* @flow */
import {Linking} from 'react-native';
import qs from 'qs';
import log from '../log/log';
import {notifyError} from '../notification/notification';

const issueIdReg = /issue(Mobile)?\/([\w-\d]+)/;

function isSameServer(url: string, serverUrl: string) {
  return url.indexOf(serverUrl) !== -1;
}

function extractId(issueUrl: ?string) {
  if (!issueUrl) {
    return null;
  }
  const match = issueUrl.match(issueIdReg);
  return match && match[2];
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
  return query;
}

function parseUrl(url, onIssueIdDetected, onQueryDetected) {
  const id = extractId(url);
  if (id) {
    log.info(`Issue id detected in open URL, id ${id}, opening issue...`);
    return onIssueIdDetected(id);
  }


  const query = extractIssuesQuery(url);
  if (query) {
    log.info(`Issues query detected in open URL: ${query}, opening list...`);
    return onQueryDetected(query);
  }
}

export default function openByUrlDetector(serverUrl: string, onIssueIdDetected: (issueId: string) => any, onQueryDetected: (query: string) => any) {
  Linking.getInitialURL()
    .then((url: ?string) => {
      if (!url) {
        return;
      }

      if (!isSameServer(url || '', serverUrl)) {
        return notifyError('Open URL error', {message: `Cannot handle "${url}" URL because it doesn\'t match the configured server`});
      }

      return parseUrl(url, onIssueIdDetected, onQueryDetected);
    });

  function onOpenWithUrl(event) {
    const url = event.url || event;

    if (!isSameServer(url || '', serverUrl)) {
      return notifyError('Open URL error', {message: `Cannot handle "${url}" URL because it doesn\'t match the configured server`});
    }

    return parseUrl(url, onIssueIdDetected, onQueryDetected);
  }

  Linking.addEventListener('url', onOpenWithUrl);

  return function unsubscribe() {
    Linking.removeEventListener('url', onOpenWithUrl);
  };
}
