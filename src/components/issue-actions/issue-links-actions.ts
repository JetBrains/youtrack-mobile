import log from '../log/log';
import {getApi} from '../api/api__instance';
import {i18n} from 'components/i18n/i18n';
import {notify, notifyError} from '../notification/notification';
import {resolveError} from '../error/error-resolver';
import {until} from 'util/util';
import type API from '../api/api';
import type {IssueFull, IssueOnList} from 'types/Issue';
import type {IssueLink, IssueLinkType} from 'types/CustomFields';

const issueCommonLinksActions = (
  issue: Partial<IssueFull>,
): {
  getIssueLinksTitle: (links?: IssueLink[]) => Promise<Array<IssueLink>>;
  loadIssueLinksTitle: () => Promise<Array<IssueLink>>;
  loadIssuesXShort: (query: string, page?: number) => Promise<IssueOnList>;
  loadLinkedIssues: () => Promise<Array<IssueLink>>;
  onLinkIssue: (
    linkedIssueIdReadable: string,
    linkTypeName: string,
  ) => Promise<boolean>;
  onUnlinkIssue: (
    linkedIssue: IssueOnList,
    linkTypeId: string,
  ) => Promise<boolean>;
  loadIssueLinkTypes: () => Promise<Array<IssueLinkType>>;
} => {
  const api: API = getApi();
  return {
    loadIssuesXShort: async (
      query: string,
      page: number = 50,
    ): Promise<IssueOnList> => {
      const [error, issues] = await until(
        api.issues.getIssuesXShort(query, page),
      );

      if (error) {
        notifyError(error);
      }

      return (issues || []).filter((it: IssueOnList) => it.id !== issue.id);
    },
    onLinkIssue: async (
      linkedIssueIdReadable: string,
      linkTypeName: string,
    ): Promise<boolean> => {
      const [error] = await until(
        api.issue.addIssueLink(
          issue.id,
          `${linkTypeName} ${linkedIssueIdReadable}`,
        ),
      );

      if (error) {
        notifyError(error);
      } else {
        notify(i18n('Issue link added'));
      }

      return !error;
    },
    loadLinkedIssues: async (): Promise<Array<IssueLink>> => {
      let issueLinks: IssueLink[];

      try {
        issueLinks = await api.issue.getIssueLinks(issue.id);
        log.info(`Linked issues loaded`);
      } catch (rawError) {
        const error = await resolveError(rawError);
        log.warn('Failed to load linked issues', error);
        issueLinks = [];
      }

      return issueLinks;
    },
    onUnlinkIssue: async (
      linkedIssue: IssueOnList,
      linkTypeId: string,
    ): Promise<boolean> => {
      const [error] = await until(
        api.issue.removeIssueLink(issue.id, linkedIssue.id, linkTypeId),
      );

      if (error) {
        notifyError(error);
      } else {
        notify(i18n('Issue link removed'));
      }

      return !error;
    },
    loadIssueLinksTitle: async function (): Promise<Array<IssueLink>> {
      let links: IssueLink[];

      try {
        links = await api.issue.getIssueLinksTitle(issue.id);
        log.info(`Linked issues title data loaded`);
      } catch (e) {
        links = [];
        const error = await resolveError(e);
        log.warn('Failed to load linked issues', error);
      }

      return links;
    },
    getIssueLinksTitle: async function (
      links?: IssueLink[],
    ): Promise<Array<IssueLink>> {
      return links || (await this.loadIssueLinksTitle());
    },
    loadIssueLinkTypes: async (): Promise<Array<IssueLinkType>> => {
      const [error, issueLinkTypes] = await until(
        api.issue.getIssueLinkTypes(),
      );

      if (error) {
        const err: Error = await resolveError(error);
        const errorMsg: string = 'Failed to link issue';
        log.warn(errorMsg, err);
      }

      return issueLinkTypes || [];
    },
  };
};

export default issueCommonLinksActions;
