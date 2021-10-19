/* @flow */

import type {IssueLink} from '../../flow/CustomFields';
import type {IssueOnList} from '../../flow/Issue';

export type LinksMap = { [string]: Array<IssueOnList> };


const getLinkTitle = (link: IssueLink): string => {
  const linkType = link.linkType;
  if (link.direction === 'OUTWARD' || link.direction === 'BOTH') {
    return linkType.localizedSourceToTarget || linkType.sourceToTarget;
  }
  return linkType.localizedTargetToSource || linkType.targetToSource;
};

const getIssueLinkedIssuesMap = (links: Array<IssueLink>): LinksMap => {
  return links.reduce((linksMap: LinksMap, link: IssueLink) => {
    if (link.trimmedIssues.length > 0) {
      linksMap[getLinkTitle(link)] = link.trimmedIssues;
    }
    return linksMap;
  }, ({}: LinksMap));
};

const getIssueLinkedIssuesTitle = (links: Array<IssueLink>): string => {
  const issueLinkedIssuesMap: LinksMap = getIssueLinkedIssuesMap(links);
  return Object.keys(issueLinkedIssuesMap).map((key: string) => {
    return issueLinkedIssuesMap[key].length > 0 ? `${issueLinkedIssuesMap[key].length} ${key}` : '';
  }).join(', ');
};


export {
  getIssueLinkedIssuesMap,
  getIssueLinkedIssuesTitle,
  getLinkTitle,
};
