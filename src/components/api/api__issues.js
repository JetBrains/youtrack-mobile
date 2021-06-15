/* @flow */

import qs from 'qs';

import ApiBase from './api__base';
import ApiHelper from './api__helper';
import issueFields from './api__issue-fields';
import {checkVersion} from '../feature/feature';

import type {IssueOnList} from '../../flow/Issue';
import type {Folder} from '../../flow/User';

const REQUEST_INTERVAL_DELAY: number = 3000;

export default class IssuesAPI extends ApiBase {
  async getIssues(query: string = '', $top: number, $skip: number = 0): Promise<Array<IssueOnList>> {
    const queryString = qs.stringify({
      query, $top, $skip,
      fields: issueFields.issuesOnList.toString(),
    });

    const issues: Array<IssueOnList> = await this.makeAuthorizedRequest(`${this.youTrackIssueUrl}?${queryString}`);
    return ApiHelper.patchAllRelativeAvatarUrls(issues, this.config.backendUrl);
  }

  async getIssuesCount(query: string | null = null, folder: ?Folder, unresolvedOnly: boolean = false): Promise<number> {
    const isActualVersion: boolean = checkVersion('2020.1');
    type Count = 'count' | 'value';
    const fieldName: Count = isActualVersion ? 'count' : 'value'; //API version specific

    const response: { [fieldName: Count]: number } = await (
      isActualVersion ? this.issuesCount(query, folder, unresolvedOnly) : this.issuesCountLegacy(query)
    );

    if (response[fieldName] === -1) {
      return new Promise(resolve => setTimeout(resolve, REQUEST_INTERVAL_DELAY))
        .then(() => this.getIssuesCount(query, folder, unresolvedOnly));
    }
    return response[fieldName];
  }

  issuesCountLegacy(query: string | null): Promise<number> {
    const queryString = qs.stringify({sync: false, filter: query});
    const url = `${this.youTrackUrl}/rest/issue/count?${queryString}`;
    return this.makeAuthorizedRequest(url);
  }

  issuesCount(query: string | null = null, folder: ?Folder, unresolvedOnly: boolean = false): Promise<number> {
    return this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/issuesGetter/count?fields=count`, //`issuesGetter/count` introduced in 2019.1.51759
      'POST',
      {
        folder: folder?.id ? {$type: folder.$type, id: folder.id} : null,
        query: query ? query.trim() : null,
        unresolvedOnly,
      }
    );
  }
}
