/* @flow */

import ApiHelper from '../api/api__helper';
import log from '../log/log';
import {getApi} from '../api/api__instance';

import type Api from '../api/api';
import type {IssueFull, IssueOnList} from '../../flow/Issue';

export const loadIssue = async (issueId: string) => {
  const api: Api = getApi();
  log.info(`Updating issue ${issueId}`);
  try {
    const issue: Array<IssueOnList> = await api.issue.getIssue(issueId);
    return ApiHelper.fillIssuesFieldHash([issue])[0];
  } catch (e) {
    log.info(`Failed to load issue ${issueId}`);
    return null;
  }
};

export const updateIssueInIssues = (
  issueToUpdate: IssueOnList,
  currentIssues: Array<IssueOnList | IssueFull>
): Array<IssueFull | IssueOnList> => {
  return (currentIssues || []).reduce((issues: Array<IssueOnList>, issue: IssueOnList) => {
    return issues.concat([issue.id === issueToUpdate.id ? issueToUpdate : issue]);
  }, []);
};
