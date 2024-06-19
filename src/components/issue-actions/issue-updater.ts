import log from 'components/log/log';
import {getApi} from 'components/api/api__instance';
import {until} from 'util/util';

import type Api from 'components/api/api';
import type {IssueFull, IssueOnList} from 'types/Issue';

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

export const updateIssueInIssues = (issueToUpdate: IssueFull, currentIssues: IssueOnList[]): IssueOnList[] => {
  return (currentIssues || []).reduce((issues: IssueOnList[], issue: IssueOnList) => {
    return issues.concat([
      issue.id === issueToUpdate.id ? ({...issue, ...issueToUpdate} as unknown as IssueOnList) : issue,
    ]);
  }, []);
};
