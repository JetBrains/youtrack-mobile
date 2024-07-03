import {DeviceEventEmitter, EmitterSubscription, Linking} from 'react-native';

import qs from 'qs';

import log from 'components/log/log';


const issueIdReg = /issue\/([\w-\d]+)/;
const ticketIdReg = /tickets\/([\w-\d]+)/;
const articleIdReg = /articles\/([\w-\d]+)/;
const helpdeskFormIdReg = /form\/([\w-\d]+)/;

const extractIssueId = (issueUrl: string = ''): string | null => {
  const url = decodeURIComponent(issueUrl);
  const matchIssue = url.match(issueIdReg);
  const matchTicket = url.match(ticketIdReg);
  if (matchTicket?.[1]) {
    log.info(`Open URL Handler: Extracted Ticket ID from URL`);
  }
  if (matchIssue?.[1]) {
    log.info(`Open URL Handler: Extracted Issue ID from URL`);
  }
  return matchIssue?.[1] || matchTicket?.[1] || null;
};

const extractArticleId = (issueUrl: string = ''): string | null => {
  const match = decodeURIComponent(issueUrl).match(articleIdReg);
  return match && match[1];
};

const extractHelpdeskFormId = (issueUrl: string = ''): string | null => {
  const match = decodeURIComponent(issueUrl).match(helpdeskFormIdReg);
  return match && match[1];
};

function extractIssuesQuery(issuesUrl: string | null | undefined): string | null {
  if (!issuesUrl) {
    return null;
  }

  const match = issuesUrl.match(/\?(.*)/);

  if (!match || !match[1]) {
    log.warn(`Open URL Handler: Cannot extract query string from URL`);
    return null;
  }

  const queryString: string = match[1];
  const query = qs.parse(queryString).q;
  if (query) {
    log.info(`Open URL Handler: query is parsed from URL`);
  }
  return query as string;
}

function parseUrl(
  url: string,
  onIdDetected: (
    url: string,
    issueId?: string,
    articleId?: string,
    helpdeskFormId?: string,
  ) => void,
  onQueryDetected: (
    url: string,
    searchQuery: string
  ) => void,
) {
  const issueId = extractIssueId(url) ?? undefined;
  const articleId = extractArticleId(url) ?? undefined;
  const helpdeskFormId = extractHelpdeskFormId(url) ?? undefined;

  if (typeof issueId === 'string' || typeof articleId === 'string' || typeof helpdeskFormId === 'string') {
    log.info(
      issueId
        ? `Open URL Handler: Issue ID detected in URL` : (articleId ? `Open URL Handler: Article ID detected in URL` : ''),
    );
    return onIdDetected(url, issueId, articleId, helpdeskFormId);
  }

  const query: string | null = extractIssuesQuery(url);
  if (query) {
    log.info('Open URL Handler: Query detected in the URL');
    return onQueryDetected(url, query);
  } else {
    log.info(`Open URL Handler: No entity ID or query detected in URL`);
  }

  DeviceEventEmitter.emit('openWithUrl', decodeURIComponent(url));
}

const openByUrlDetector = async (
  onIdDetected: (url: string, issueId?: string, articleId?: string, formId?: string) => any,
  onQueryDetected: (url: string, query: string) => any,
) => {
  setTimeout(() => {
    Linking.getInitialURL().then((url: string | null) => {
      if (url) {
        log.info('Open URL Handler: App has been initially started by pressing an URL');
        return parseUrl(url, onIdDetected, onQueryDetected);
      }
    });
  }, 100);

  const onURLOpen = (event: { url: string } | string) => {
    const url: string = typeof event === 'string' ? event : event?.url;
    if (url) {
      log.info(`Open URL Handler: On URL press event is fired`);
      parseUrl(url, onIdDetected, onQueryDetected);
    }
  };

  const unsubscribe: EmitterSubscription = Linking.addEventListener('url', onURLOpen);
  return () => unsubscribe?.remove?.();
};


export {
  extractArticleId,
  extractIssueId,
  extractHelpdeskFormId,
  openByUrlDetector,
  extractIssuesQuery,
};
