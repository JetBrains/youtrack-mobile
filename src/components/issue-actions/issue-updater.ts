import ApiHelper from '../api/api__helper';
import log from '../log/log';
import {getApi} from '../api/api__instance';
import {until} from 'util/util';

import type Api from '../api/api';
import {IssueFull, IssueOnList} from 'types/Issue';

export const loadIssue = async (issueId: string): Promise<IssueFull> => {
  const api: Api = getApi();
  log.info(`Issue Updater: Updating Issue`);
  const [error, issue] = await until(api.issue.getIssue(issueId));

  if (error || !issue) {
    log.info(`Issue Updater: Failed to load Issue`);
    return {} as IssueFull;
  } else {
    return ApiHelper.fillIssuesFieldHash([issue])[0] as IssueFull;
  }
};

export const updateIssueInIssues = (issueToUpdate: IssueOnList | IssueFull, currentIssues: IssueOnList[]): IssueOnList[] => {
  return (currentIssues || []).reduce(
    (issues: IssueOnList[], issue: IssueOnList) => {
      return issues.concat([
        issue.id === issueToUpdate.id ? {...issue, ...issueToUpdate} : issue,
      ]);
    },
    [],
  );
};
