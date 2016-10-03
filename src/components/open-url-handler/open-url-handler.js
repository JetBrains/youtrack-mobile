import {Linking} from 'react-native';
import qs from 'qs';
import log from '../log/log';

const issueIdReg = /issue(Mobile)?\/([\w-\d]+)/;

function extractId(issueUrl) {
  if (!issueUrl) {
    return null;
  }
  const match = issueUrl.match(issueIdReg);
  return match && match[2];
}

function extractIssuesQuery(issuesUrl) {
  if (!issuesUrl) {
    return null;
  }
  const [, query_string] = issuesUrl.match(/\?(.*)/);
  const query = qs.parse(query_string).q;
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

export default function openByUrlDetector(onIssueIdDetected, onQueryDetected) {
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
