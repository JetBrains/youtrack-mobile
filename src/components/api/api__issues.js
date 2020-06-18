/* @flow */
import qs from 'qs';
import ApiBase from './api__base';
import issueFields from './api__issue-fields';

import type {IssueOnList} from '../../flow/Issue';
import ApiHelper from './api__helper';

export default class IssuesAPI extends ApiBase {
  async getIssues(query: string = '', $top: number, $skip: number = 0): Promise<IssueOnList> {
    const queryString = qs.stringify({
      query, $top, $skip,
      fields: issueFields.issuesOnList.toString()
    });

    const issues = await this.makeAuthorizedRequest(`${this.youTrackIssueUrl}?${queryString}`);
    ApiHelper.patchAllRelativeAvatarUrls(issues, this.config.backendUrl);
    return issues;
  }

  // `issuesGetter/count` introduced in 2019.1.51759
  async getIssuesCount(query: string = ''): Promise<number> {
    const queryString = qs.stringify({sync: false, filter: query});
    const countRes = await this.makeAuthorizedRequest(`${this.youTrackUrl}/rest/issue/count?${queryString}`);
    // If server returns -1 it means that counter is not ready yet, should reload
    if (countRes.value === -1) {
      return new Promise(resolve => setTimeout(resolve, 500))
        .then(() => this.getIssuesCount(query));
    }
    return countRes.value;
  }
}
