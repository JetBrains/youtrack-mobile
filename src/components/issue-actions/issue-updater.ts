import log from 'components/log/log';
import {getApi} from 'components/api/api__instance';
import {until} from 'util/util';

import type Api from 'components/api/api';
import type {IssueFull, IssueOnListExtended} from 'types/Issue';

export const loadIssue = async (issueId: string): Promise<IssueFull> => {
  const api: Api = getApi();
  log.info(`Issue Updater: Updating Issue`);
  const [error, issue] = await until<IssueFull>(api.issue.getIssue(issueId));

  if (error || !issue) {
    log.info(`Issue Updater: Failed to load Issue`);
    return {} as IssueFull;
  } else {
    return issue;
  }
};

export const updateIssueInIssues = (issueToUpdate: IssueFull, currentIssues: IssueOnListExtended[]): IssueOnListExtended[] => {
  return (currentIssues || []).reduce((issues: IssueOnListExtended[], issue: IssueOnListExtended) => {
    return issues.concat([
      issue.id === issueToUpdate.id ? ({...issue, ...issueToUpdate} as unknown as IssueOnListExtended) : issue,
    ]);
  }, []);
};
