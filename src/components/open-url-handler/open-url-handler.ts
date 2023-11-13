import {DeviceEventEmitter, EmitterSubscription, Linking} from 'react-native';

import qs from 'qs';

import log from 'components/log/log';


const issueIdReg = /issue\/([\w-\d]+)/;

const articleIdReg = /articles\/([\w-\d]+)/;
const extractIssueId = (issueUrl: string = ''): string | null => {
  const match = decodeURIComponent(issueUrl).match(issueIdReg);
  return match && match[1];
};

const extractArticleId = (issueUrl: string = ''): string | null => {
  const match = decodeURIComponent(issueUrl).match(articleIdReg);
  return match && match[1];
};

function extractIssuesQuery(issuesUrl: string | null | undefined): string | null {
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
  return query as string;
}

function parseUrl(
  url: string,
  onIdDetected: (
    url: string,
    issueId?: string,
    articleId?: string,
  ) => void,
  onQueryDetected: (
    url: string,
    searchQuery: string
  ) => void,
) {
  const issueId: string | null = extractIssueId(url);
  const articleId: string | null = extractArticleId(url);

  if (issueId || articleId) {
    log.info(
      issueId
        ? `Issue ID detected in URL: ${issueId}` : (articleId
          ? `Article ID detected in URL: ${articleId}`
          : ''),
    );
    return onIdDetected(url, issueId as string, articleId as string);
  }

  const query: string | null = extractIssuesQuery(url);
  if (query) {
    log.info(`Query detected in URL: ${query}`);
    return onQueryDetected(url, query);
  } else {
    log.info(`No entity ID or query detected in URL ${url}`);
  }

  DeviceEventEmitter.emit('openWithUrl', decodeURIComponent(url));
}

const openByUrlDetector = async (
  onIdDetected: (url: string, issueId?: string, articleId?: string) => any,
  onQueryDetected: (url: string, query: string) => any,
) => {
  setTimeout(() => {
    Linking.getInitialURL().then((url: string | null) => {
      log.debug(`App has been initially started with URL "${url || 'NOPE'}"`);
      if (url) {
        return parseUrl(url, onIdDetected, onQueryDetected);
      }
    });
  }, 100);

  const onURLOpen = (event: { url: string } | string) => {
    const url: string = event?.url || event;
    if (url) {
      log.debug(`Linking URL event fired with URL "${url}"`);
      parseUrl(url, onIdDetected, onQueryDetected);
    }
  };

  const unsubscribe: EmitterSubscription = Linking.addEventListener('url', onURLOpen);
  return () => unsubscribe?.remove?.();
};


export {
  extractArticleId,
  extractIssueId,
  openByUrlDetector,
  extractIssuesQuery,
};
