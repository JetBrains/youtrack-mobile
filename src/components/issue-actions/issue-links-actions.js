/* @flow */

import log from '../log/log';
import {getApi} from '../api/api__instance';
import {notify} from '../notification/notification';
import {resolveError} from '../error/error-resolver';
import {until} from 'util/util';

import type API from '../api/api';
import type {IssueFull, IssueOnList} from 'flow/Issue';
import type {IssueLink, IssueLinkType} from 'flow/CustomFields';


const issueCommonLinksActions = (issue: $Shape<IssueFull>): {
  getIssueLinksTitle: (links?: Array<IssueLink>) => Promise<Array<IssueLink>>,
  loadIssueLinksTitle: () => Promise<Array<IssueLink>>,
  loadIssuesXShort: (query: string, page?: number) => Promise<IssueOnList>,
  loadLinkedIssues: () => Promise<Array<IssueLink>>,
  onLinkIssue: (linkedIssueIdReadable: string, linkTypeName: string) => Promise<boolean>,
  onUnlinkIssue: (linkedIssue: IssueOnList, linkTypeId: string) => Promise<boolean>,
  loadIssueLinkTypes: () => Promise<Array<IssueLinkType>>,
} => {
  const api: API = getApi();

  return {
    loadIssuesXShort: async (query: string, page: number = 50): Promise<IssueOnList> => {
      const [error, issues] = await until(api.issues.getIssuesXShort(query, page));
      if (error) {
        const err: Error = await resolveError(error);
        const errorMsg: string = 'Failed to load issues';
        log.warn(errorMsg, err);
        notify(errorMsg);
      }
      return (issues || []).filter((it: IssueOnList) => it.id !== issue.id);
    },

    onLinkIssue: async (linkedIssueIdReadable: string, linkTypeName: string): Promise<boolean> => {
      const [error] = await until(api.issue.addIssueLink(
        issue.id,
        `${linkTypeName} ${linkedIssueIdReadable}`
      ));
      if (error) {
        const err: Error = await resolveError(error);
        const errorMsg: string = 'Failed to link issue';
        log.warn(errorMsg, err);
        notify(errorMsg);
      } else {
        notify('Issue link added');
      }
      return !error;
    },

    loadLinkedIssues: async (): Promise<Array<IssueLink>> => {
      let issueLinks: Array<IssueLink>;
      try {
        issueLinks = await api.issue.getIssueLinks(issue.id);
        log.info(`"${issue.id}" linked issues loaded`);
      } catch (rawError) {
        const error = await resolveError(rawError);
        log.warn('Failed to load linked issues', error);
        issueLinks = [];
      }
      return issueLinks;
    },

    onUnlinkIssue: async (linkedIssue: IssueOnList, linkTypeId: string): Promise<boolean> => {
      const [error] = await until(api.issue.removeIssueLink(issue.id, linkedIssue.id, linkTypeId));
      if (error) {
        const err: Error = await resolveError(error);
        const errorMsg: string = 'Failed to load linked issues';
        log.warn(errorMsg, err);
        notify(errorMsg);
      } else {
        notify('Issue link removed');
      }
      return !error;
    },

    loadIssueLinksTitle: async function (): Promise<Array<IssueLink>> {
      let links: Array<IssueLink>;
      try {
        links = await api.issue.getIssueLinksTitle(issue.id);
        log.info(`"${issue.id}" linked issues title data loaded`);
      } catch (rawError) {
        links = [];
        const error = await resolveError(rawError);
        log.warn('Failed to load linked issues', error);
      }
      return links;
    },

    getIssueLinksTitle: async function(links?: Array<IssueLink>): Promise<Array<IssueLink>> {
      return links || await this.loadIssueLinksTitle();
    },

    loadIssueLinkTypes: async (): Promise<Array<IssueLinkType>> => {
      const [error, issueLinkTypes] = await until(api.issue.getIssueLinkTypes());
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
