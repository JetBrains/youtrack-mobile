/* @flow */

import qs from 'qs';

import ApiBase from './api__base';
import ApiHelper from './api__helper';
import issueFields from './api__issue-fields';
import {checkVersion} from '../feature/feature';
import {routeMap} from '../../app-routes';

import type {IssueOnList} from '../../flow/Issue';
import type {Folder} from '../../flow/User';

export default class IssuesAPI extends ApiBase {
  async getIssues(query: string = '', $top: number, $skip: number = 0): Promise<Array<IssueOnList>> {
    const queryString = qs.stringify({
      query, $top, $skip,
      fields: issueFields.issuesOnList.toString(),
    });

    const issues: Array<IssueOnList> = await this.makeAuthorizedRequest(`${this.youTrackIssueUrl}?${queryString}`);
    return ApiHelper.patchAllRelativeAvatarUrls(issues, this.config.backendUrl);
  }

  async getIssuesCount(
    query: string | null = null,
    folder: ?Folder,
    unresolvedOnly: boolean = false,
    abortController: AbortController,
  ): Promise<number> {
    const isActualVersion: boolean = checkVersion('2020.1');
    type Count = 'count' | 'value';
    const fieldName: Count = isActualVersion ? 'count' : 'value'; //API version specific

    const response: { [fieldName: Count]: number } = await (
      isActualVersion
        ? this.issuesCount(query, folder, unresolvedOnly, abortController)
        : this.issuesCountLegacy(query, abortController)
    );
    return response[fieldName];
  }

  issuesCountLegacy(query: string | null, abortController: AbortController): Promise<number> {
    const queryString = qs.stringify({sync: false, filter: query});
    const url = `${this.youTrackUrl}/rest/issue/count?${queryString}`;
    return this.makeAuthorizedRequest(
      url,
      null,
      null, {
        controller: {
          [routeMap.Issues]: abortController,
        },
      }
    );
  }

  /*
  * @since 2019.1.51759
   */
  issuesCount(
    query: string | null = null,
    folder: ?Folder,
    unresolvedOnly: boolean = false,
    abortController: AbortController,
  ): Promise<number> {
    return this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/issuesGetter/count?fields=count`,
      'POST',
      {
        folder: folder?.id ? {$type: folder.$type, id: folder.id} : null,
        query: query ? query.trim() : null,
        unresolvedOnly,
      },
      {
        controller: {
          [routeMap.Issues]: abortController,
        },
      },
    );
  }
}
