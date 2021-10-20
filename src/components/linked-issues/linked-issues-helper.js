/* @flow */

import type {IssueLink} from '../../flow/CustomFields';
import type {IssueOnList} from '../../flow/Issue';

export type LinksMap = { [string]: IssueLink };

export type LinksListData = {
  title: string,
  data: Array<IssueOnList>,
  linkTypeId: string,
};

const getLinkTitle = (link: IssueLink): string => {
  const linkType = link.linkType;
  if (link.direction === 'OUTWARD' || link.direction === 'BOTH') {
    return linkType.localizedSourceToTarget || linkType.sourceToTarget;
  }
  return linkType.localizedTargetToSource || linkType.targetToSource;
};

const getLinkedIssuesMap = (links: Array<IssueLink>): LinksMap => {
  return links.reduce((linksMap: LinksMap, link: IssueLink) => {
    if (link.issuesSize > 0) {
      linksMap[getLinkTitle(link)] = link;
    }
    return linksMap;
  }, ({}: LinksMap));
};

const getLinkedIssuesTitle = (links: Array<IssueLink>): string => {
  const linkedIssuesMap: LinksMap = getLinkedIssuesMap(links);
  return Object.keys(linkedIssuesMap).map((key: string) => {
    const issuesLength: number = linkedIssuesMap[key].issuesSize;
    return issuesLength > 0 ? `${issuesLength} ${key}` : '';
  }).join(', ');
};

const createLinksList = (links: Array<IssueLink>): Array<LinksListData> => {
  const linkedIssuesMap: LinksMap = getLinkedIssuesMap(links);
  return Object.keys(linkedIssuesMap).map(
    (title: string) => ({
      title,
      data: linkedIssuesMap[title].trimmedIssues,
      linkTypeId: linkedIssuesMap[title].id,
    })
  );
};


export {
  createLinksList,
  getLinkedIssuesMap,
  getLinkedIssuesTitle,
  getLinkTitle,
};
