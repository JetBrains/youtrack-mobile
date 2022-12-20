import ApiHelper from '../api/api__helper';
import log from '../log/log';
import {getApi} from '../api/api__instance';
import {until} from 'util/util';
import type Api from '../api/api';
import type {AnyIssue, IssueFull} from 'flow/Issue';
export const loadIssue = async (issueId: string): Promise<IssueFull | null> => {
  const api: Api = getApi();
  log.info(`Updating issue ${issueId}`);
  const [error, issue] = await until(api.issue.getIssue(issueId));

  if (error) {
    log.info(`Failed to load issue ${issueId}`);
    return null;
  } else {
    return ApiHelper.fillIssuesFieldHash([issue])[0] as any;
  }
};
export const updateIssueInIssues = (
  issueToUpdate: AnyIssue,
  currentIssues: Array<AnyIssue>,
): Array<AnyIssue> => {
  return (currentIssues || []).reduce(
    (issues: Array<AnyIssue>, issue: AnyIssue) => {
      return issues.concat([
        issue?.id === issueToUpdate?.id ? issueToUpdate : issue,
      ]);
    },
    [],
  );
};