import {DeviceEventEmitter, Linking} from 'react-native';
import qs from 'qs';
import log from '../log/log';
const issueIdReg = /issue\/([\w-\d]+)/;
const articleIdReg = /articles\/([\w-\d]+)/;
export function extractIssueId(issueUrl: string = ''): string | null {
  const match = decodeURIComponent(issueUrl).match(issueIdReg);
  return match && match[1];
}
export function extractArticleId(issueUrl: string = ''): string | null {
  const match = decodeURIComponent(issueUrl).match(articleIdReg);
  return match && match[1];
}

function extractIssuesQuery(issuesUrl: string | null | undefined) {
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

function parseUrl(url: string, onIssueIdDetected, onQueryDetected) {
  const issueId: string | null | undefined = extractIssueId(url);
  const articleId: string | null | undefined = extractArticleId(url);

  if (issueId || articleId) {
    log.info(
      issueId
        ? `Issue ID detected in URL: ${issueId}`
        : articleId
        ? `Article ID detected in URL: ${articleId}`
        : '',
    );
    return onIssueIdDetected(url, issueId, articleId);
  } else {
    log.info(`(parseUrl): cannot extract entity id from ${url}`);
  }

  const query = extractIssuesQuery(url);

  if (query) {
    log.info(`Issues query detected in open URL: ${query}`);
    return onQueryDetected(url, query);
  }

  DeviceEventEmitter.emit('openWithUrl', decodeURIComponent(url));
}

export default function openByUrlDetector(
  onIssueIdDetected: (
    url: string,
    issueId: string | null | undefined,
    articleId: string | null | undefined,
  ) => any,
  onQueryDetected: (url: string, query: string) => any,
): () => void {
  Linking.getInitialURL().then((url: string | null | undefined) => {
    log.debug(`App has been initially started with URL "${url || 'NOPE'}"`);

    if (!url) {
      return;
    }

    return parseUrl(url, onIssueIdDetected, onQueryDetected);
  });

  function onOpenWithUrl(event: any) {
    const url: string = event.url || event;
    log.debug(`Linking URL event fired with URL "${url}"`);
    return parseUrl(url, onIssueIdDetected, onQueryDetected);
  }

  Linking.addEventListener('url', onOpenWithUrl);
  return function unsubscribe() {
    Linking.removeEventListener('url', onOpenWithUrl);
  };
}