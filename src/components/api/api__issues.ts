import qs from 'qs';

import ApiBase from './api__base';
import ApiHelper from './api__helper';
import issueFields from './api__issue-fields';
import {checkVersion, FEATURE_VERSION} from 'components/feature/feature';
import {issuesViewSettingMode} from 'views/issues';
import {routeMap} from 'app-routes';

import type {Folder} from 'types/User';
import type {IssueOnList} from 'types/Issue';
import {IssueFull} from 'types/Issue';

export type SortedIssues = { tree: { id: string }[] | undefined };

export default class IssuesAPI extends ApiBase {
  async _getIssues(
    query: string = '',
    $top: number,
    $skip: number = 0,
    fields: string,
  ): Promise<Array<IssueOnList>> {
    const q: string = qs.stringify(
      {
        $top,
        $skip,
        query,
        fields,
      },
      {
        encode: false,
      },
    );
    return this.makeAuthorizedRequest(`${this.youTrackIssueUrl}?${q}`);
  }

  async sortedIssues(
    folderId: string,
    query: string = '',
    topRoot: number,
    skipRoot: number = 0,
  ): Promise<SortedIssues> {
    const q: string = qs.stringify(
      {
        folderId: folderId !== null ? folderId : undefined,
        topRoot,
        skipRoot,
        query: encodeURIComponent(query),
        fields: 'tree(id)',
        flatten: true,
      },
      {
        encode: false,
      },
    );

    return this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/sortedIssues?${q}`
    );
  }

  async issuesGetter(issueIds: { id: string; }[], viewMode: number): Promise<IssueFull[]> {
    const fields = (
      viewMode === issuesViewSettingMode.M
        ? issueFields.issuesOnList
        : viewMode === issuesViewSettingMode.L ? issueFields.issuesOnListL : issueFields.issuesOnListS
    );
    const issues = await this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/issuesGetter?${qs.stringify({
        fields: fields.toString(),
      })}`,
      'POST',
      issueIds,
    );
    return ApiHelper.patchAllRelativeAvatarUrls(issues, this.config.backendUrl);
  }

  async getIssuesXShort(
    query: string = '',
    $top: number,
    $skip?: number,
  ): Promise<Array<Partial<IssueOnList>>> {
    return await this._getIssues(
      query,
      $top,
      $skip,
      issueFields.issueLinks.toString(),
    );
  }

  async getIssuesCount(
    query: string | null = null,
    folder: Folder | null | undefined,
    unresolvedOnly: boolean = false,
    abortController?: AbortController,
  ): Promise<number> {
    const isActualVersion: boolean = checkVersion(FEATURE_VERSION.issuesGetter);
    type Count = 'count' | 'value';
    const fieldName: Count = isActualVersion ? 'count' : 'value'; //API version specific

    const response: Record<Count, number> = await (isActualVersion
      ? this.issuesCount(query, folder, unresolvedOnly, abortController)
      : this.issuesCountLegacy(query, abortController));
    return response[fieldName];
  }

  issuesCountLegacy(
    query: string | null,
    abortController?: AbortController,
  ): Promise<number> {
    const queryString = qs.stringify({
      sync: false,
      filter: query,
    });
    const url = `${this.youTrackUrl}/rest/issue/count?${queryString}`;
    return this.makeAuthorizedRequest(url, null, null, {
      controller: {
        [routeMap.Issues]: abortController,
      },
    });
  }

  /*
   * @since 2019.1.51759
   */
  issuesCount(
    query: string | null = null,
    folder: Folder | null | undefined,
    unresolvedOnly: boolean = false,
    abortController?: AbortController,
  ): Promise<number> {
    return this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/issuesGetter/count?fields=count`,
      'POST',
      {
        folder: folder?.id
          ? {
              $type: folder.$type,
              id: folder.id,
            }
          : null,
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
