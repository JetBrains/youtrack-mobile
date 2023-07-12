import type {IssueLink, IssueLinkType} from 'types/CustomFields';
import type {IssueOnList} from 'types/Issue';
export type LinksMap = Record<string, IssueLink>;
export type LinksListData = {
  title: string;
  data: IssueOnList[];
  linkTypeId: string;
  unresolvedIssuesSize: number;
};
const INWARD_ISSUE_ID_POSTFIX: string = 't';
const OUTWARD_ISSUE_ID_POSTFIX: string = 's';

const getLinkTypePresentation = (linkType: IssueLinkType, sourceToTarget: boolean): string => {
  return (
    sourceToTarget
      ? linkType.localizedSourceToTarget || linkType.sourceToTarget
      : linkType.localizedTargetToSource || linkType.targetToSource
  );
};


const getLinkTitle = (link: IssueLink): string => {
  return getLinkTypePresentation(
    link.linkType,
    link.direction === 'OUTWARD' || link.direction === 'BOTH'
  );
};

const getLinkedIssuesMap = (links: IssueLink[]): LinksMap => {
  return links.reduce((linksMap: LinksMap, link: IssueLink) => {
    if (link.issuesSize > 0) {
      linksMap[getLinkTitle(link)] = link;
    }

    return linksMap;
  }, {} as LinksMap);
};

const getLinkedIssuesTitle = (links: IssueLink[]): string => {
  const linkedIssuesMap: LinksMap = getLinkedIssuesMap(links);
  return Object.keys(linkedIssuesMap)
    .map((key: string) => {
      const issuesLength: number = linkedIssuesMap[key].issuesSize;
      return issuesLength > 0 ? `${issuesLength} ${key}` : '';
    })
    .join(', ');
};

const createLinksList = (links: IssueLink[]): LinksListData[] => {
  const linkedIssuesMap: LinksMap = getLinkedIssuesMap(links);
  return Object.keys(linkedIssuesMap).map((title: string) => {
    const it: IssueLink = linkedIssuesMap[title];
    return {
      title,
      data: it.trimmedIssues,
      linkTypeId: it.id,
      unresolvedIssuesSize: it.unresolvedIssuesSize,
    };
  });
};

function getIssueLinkIdSuffix(directed: boolean, outward: boolean) {
  if (!directed) {
    return '';
  }

  return outward ? OUTWARD_ISSUE_ID_POSTFIX : INWARD_ISSUE_ID_POSTFIX;
}

function createIssueLink(linkType: IssueLinkType, outward: boolean) {
  const isSourceToTargetLink = (opposite: boolean): boolean => opposite && linkType.directed ? !outward : outward;

  return {
    type: linkType,
    outward: outward,
    id: linkType.id + getIssueLinkIdSuffix(linkType.directed, outward),
    getPresentation: (opposite: boolean = false) =>
      isSourceToTargetLink(opposite)
        ? getLinkTypePresentation(linkType, true)
        : getLinkTypePresentation(linkType, false),
    getName: (opposite: boolean = false) =>
      isSourceToTargetLink(opposite)
        ? linkType.sourceToTarget
        : linkType.targetToSource,
  };
}

export type IssueLinkTypeExtended = {
  type: IssueLinkType;
  outward: boolean;
  id: string;
  getPresentation: (opposite?: boolean) => string;
  getName: (opposite?: boolean) => string;
};

const createLinkTypes = (
  linkTypes: IssueLinkType[],
): IssueLinkTypeExtended[] => {
  return linkTypes.reduce(
    (directions: IssueLinkTypeExtended[], linkType: IssueLinkType) => {
      directions.push(createIssueLink(linkType, true));

      if (linkType.directed) {
        directions.push(createIssueLink(linkType, false));
      }

      return directions;
    },
    [],
  );
};

export {
  createLinkTypes,
  createLinksList,
  getLinkedIssuesMap,
  getLinkedIssuesTitle,
  getLinkTitle,
};
