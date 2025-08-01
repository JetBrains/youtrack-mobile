import log from 'components/log/log';
import {getApi} from 'components/api/api__instance';
import {i18n} from 'components/i18n/i18n';
import {notify, notifyError} from 'components/notification/notification';
import {resolveError} from 'components/error/error-resolver';
import {until} from 'util/util';

import type API from 'components/api/api';
import type {AnyError} from 'types/Error.ts';
import type {EntityBase} from 'types/Entity';
import type {IssueLink, IssueLinkType} from 'types/CustomFields';
import type {IssueOnListExtended} from 'types/Issue';

const issueCommonLinksActions = (issue: EntityBase): {
  getIssueLinksTitle: (links?: IssueLink[]) => Promise<Array<IssueLink>>;
  loadIssueLinksTitle: () => Promise<Array<IssueLink>>;
  loadIssuesXShort: (query: string, page?: number) => Promise<IssueOnListExtended>;
  loadLinkedIssues: () => Promise<Array<IssueLink>>;
  onLinkIssue: (
    linkedIssueIdReadable: string,
    linkTypeName: string,
  ) => Promise<boolean>;
  onUnlinkIssue: (
    linkedIssue: IssueOnListExtended,
    linkTypeId: string,
  ) => Promise<boolean>;
  loadIssueLinkTypes: () => Promise<Array<IssueLinkType>>;
} => {
  const api: API = getApi();
  return {
    loadIssuesXShort: async (
      query: string,
      page: number = 50,
    ): Promise<IssueOnListExtended> => {
      const [error, issues] = await until(
        api.issues.getIssuesXShort(query, page),
      );

      if (error) {
        notifyError(error);
      }

      return (issues || []).filter((it: IssueOnListExtended) => it.id !== issue.id);
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
        const error = await resolveError(rawError as AnyError);
        log.warn('Failed to load linked issues', error);
        issueLinks = [];
      }

      return issueLinks;
    },
    onUnlinkIssue: async (
      linkedIssue: IssueOnListExtended,
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
        const error = await resolveError(e as AnyError);
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
        const err = await resolveError(error);
        const errorMsg: string = 'Failed to link issue';
        log.warn(errorMsg, err);
      }

      return issueLinkTypes || [];
    },
  };
};

export default issueCommonLinksActions;
