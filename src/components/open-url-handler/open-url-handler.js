/* @flow */
import {Linking} from 'react-native';
import qs from 'qs';
import log from '../log/log';

const issueIdReg = /issue(Mobile)?\/([\w-\d]+)/;

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
    throw new Error(`Cannot extract query string from ${issuesUrl}`);
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
    .then(url => parseUrl(url, onIssueIdDetected, onQueryDetected));

  function onOpenWithUrl(event) {
    const url = event.url || event;
    return parseUrl(url, onIssueIdDetected, onQueryDetected);
  }

  Linking.addEventListener('url', onOpenWithUrl);

  return function unsubscribe() {
    Linking.removeEventListener('url', onOpenWithUrl);
  };
}
