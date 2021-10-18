/* @flow */

import type {IssueLink} from '../../flow/CustomFields';

type LinksMap = { [string]: number };


const getLinkTitle = (link: IssueLink): string => {
  if (link.direction === 'OUTWARD' || link.direction === 'BOTH') {
    return link.linkType.localizedSourceToTarget || link.linkType.sourceToTarget;
  }
  return link.linkType.localizedTargetToSource || link.linkType.targetToSource;
};

const getIssueLinkedIssuesMap = (links: Array<IssueLink>): LinksMap => {
  return links.reduce((linksMap: LinksMap, link: IssueLink) => {
    if (link.trimmedIssues.length > 0) {
      linksMap[getLinkTitle(link)] = link.trimmedIssues.length;
    }
    return linksMap;
  }, ({}: LinksMap));
};

const getIssueLinkedIssuesTitle = (links: Array<IssueLink>): string => {
  const issueLinkedIssuesMap: LinksMap = getIssueLinkedIssuesMap(links);
  return Object.keys(issueLinkedIssuesMap).map((key: string) => {
    return issueLinkedIssuesMap[key] > 0 ? `${issueLinkedIssuesMap[key]} ${key}` : '';
  }).join(', ');
};


export {
  getLinkTitle,
  getIssueLinkedIssuesTitle,
};
