/* @flow */

import type {IssueLink, IssueLinkType} from '../../flow/CustomFields';
import type {IssueOnList} from '../../flow/Issue';

export type LinksMap = { [string]: IssueLink };

export type LinksListData = {
  title: string,
  data: Array<IssueOnList>,
  linkTypeId: string,
  unresolvedIssuesSize: number,
};

const INWARD_ISSUE_ID_POSTFIX: string = 't';
const OUTWARD_ISSUE_ID_POSTFIX: string = 's';


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
    (title: string) => {
      const it: IssueLink = linkedIssuesMap[title];
      return ({
        title,
        data: it.trimmedIssues,
        linkTypeId: it.id,
        unresolvedIssuesSize: it.unresolvedIssuesSize,
      });
    }
  );
};

function getIssueLinkIdSuffix(directed: boolean, outward: boolean) {
  if (!directed) {
    return '';
  }
  return outward ? OUTWARD_ISSUE_ID_POSTFIX : INWARD_ISSUE_ID_POSTFIX;
}

function createIssueLink(linkType: IssueLinkType, outward: boolean) {
  const isSourceToTargetLink = (opposite: boolean): boolean => (opposite && linkType.directed) ? !outward : outward;
  return {
    type: linkType,
    outward: outward,
    id: linkType.id + getIssueLinkIdSuffix(linkType.directed, outward),
    getPresentation: (opposite: boolean = false) => (
      isSourceToTargetLink(opposite)
        ? (linkType.localizedSourceToTarget || linkType.sourceToTarget)
        : (linkType.localizedTargetToSource || linkType.targetToSource)
    ),
    getName: (opposite: boolean = false) => (
      isSourceToTargetLink(opposite)
        ? linkType.sourceToTarget
        : linkType.targetToSource
    ),
  };
}

export type IssueLinkTypeExtended = {
  type: IssueLinkType,
  outward: boolean,
  id: string,
  getPresentation: (opposite?: boolean) => string,
  getName: (opposite?: boolean) => string,
};

const createLinkTypes = (linkTypes: Array<IssueLinkType>): Array<IssueLinkTypeExtended> => {
  return linkTypes.reduce((directions: Array<IssueLinkTypeExtended>, linkType: IssueLinkType) => {
    directions.push(createIssueLink(linkType, true));
    if (linkType.directed) {
      directions.push(createIssueLink(linkType, false));
    }
    return directions;
  }, []);
};



export {
  createLinkTypes,
  createLinksList,
  getLinkedIssuesMap,
  getLinkedIssuesTitle,
  getLinkTitle,
};
