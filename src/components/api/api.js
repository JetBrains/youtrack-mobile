/* @flow */
import qs from 'qs';
import issueFields from './api__issue-fields';
import agileFields from './api__agile-fields';
import Auth from '../auth/auth';
import log from '../log/log';
import ApiHelper from './api__helper';
import {handleRelativeUrl} from '../config/config';
import type {SprintFull, AgileUserProfile, AgileBoardRow, BoardOnList} from '../../flow/Agile';
import type {AppConfigFilled} from '../../flow/AppConfig';
import type {IssueOnList, IssueFull, TransformedSuggestion, SavedQuery, CommandSuggestionResponse} from '../../flow/Issue';
import type {IssueProject, FieldValue} from '../../flow/CustomFields';

const STATUS_UNAUTHORIZED = 401;
const STATUS_OK_IF_MORE_THAN = 200;
const STATUS_BAD_IF_MORE_THATN = 300;

const MAX_QUERY_LENGTH = 2048;

class Api {
  auth: Auth;
  config: AppConfigFilled;
  youTrackUrl: string;
  youTrackIssueUrl: string;
  youTrackProjectUrl: string;
  youtTrackFieldBundleUrl: string;

  constructor(auth: Auth) {
    this.auth = auth;
    this.config = auth.config;

    this.youTrackUrl = this.config.backendUrl;
    this.youTrackIssueUrl = `${this.youTrackUrl}/api/issues`;
    this.youTrackProjectUrl =`${this.youTrackUrl}/api/admin/projects`;

    this.youtTrackFieldBundleUrl = `${this.youTrackUrl}/api/admin/customFieldSettings/bundles`;
  }

  async makeAuthorizedRequest(url: string, method: ?string, body: ?Object) {
    assertLongQuery(url);

    const sendRequest = async () => {
      return await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/plain, */*',
          ...this.auth.getAuthorizationHeaders()
        },
        body: JSON.stringify(body)
      });
    };

    let res = await sendRequest();

    if (res.status === STATUS_UNAUTHORIZED) {
      log.info('Looks like the token is expired, will try to refresh', res);
      await this.auth.refreshToken();
      res = await sendRequest();
    }

    if (res.status < STATUS_OK_IF_MORE_THAN || res.status >= STATUS_BAD_IF_MORE_THATN) {
      throw res;
    }

    return await res.json();
  }

  async hackishGetIssueByIssueReadableId(issueId: string) {
    const queryString = qs.stringify({
      query: `issue id: ${issueId}`,
      $top: 1,
      fields: issueFields.singleIssue.toString()
    });

    const issues = await this.makeAuthorizedRequest(`${this.youTrackIssueUrl}?${queryString}`);
    return issues[0];
  }

  async getIssue(id: string): Promise<IssueFull> {
    const queryString = qs.stringify({
      fields: issueFields.singleIssue.toString()
    }, {encode: false});

    const issue = await this.makeAuthorizedRequest(`${this.youTrackIssueUrl}/${id}?${queryString}`);

    issue.comments.forEach(comment => {
      comment.author.avatarUrl = handleRelativeUrl(comment.author.avatarUrl, this.config.backendUrl);
    });
    issue.attachments = ApiHelper.convertRelativeUrls(issue.attachments, 'url', this.config.backendUrl);

    return issue;
  }

  async getIssues(query: string = '', $top: number, $skip: number = 0): Promise<IssueOnList> {
    const queryString = qs.stringify({
      query, $top, $skip,
      fields: issueFields.issuesOnList.toString()
    });

    return await this.makeAuthorizedRequest(`${this.youTrackIssueUrl}?${queryString}`);
  }

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

  async getSavedQueries(): Promise<Array<SavedQuery>> {
    const queryString = qs.stringify({fields: issueFields.issueFolder.toString()});
    return await this.makeAuthorizedRequest(`${this.youTrackUrl}/api/savedQueries?${queryString}`);
  }

  async createIssue(issueDraft: IssueOnList) {
    const queryString = qs.stringify({
      draftId: issueDraft.id,
      fields: issueFields.issuesOnList.toString()
    });
    return await this.makeAuthorizedRequest(`${this.youTrackIssueUrl}?${queryString}`, 'POST', {});
  }

  async loadIssueDraft(draftId: string): IssueFull {
    const queryString = qs.stringify({fields: issueFields.singleIssue.toString()});
    const issue = await this.makeAuthorizedRequest(`${this.youTrackUrl}/api/admin/users/me/drafts/${draftId}?${queryString}`);
    issue.attachments = ApiHelper.convertRelativeUrls(issue.attachments, 'url', this.config.backendUrl);
    return issue;
  }

  /**
   * Creates (if issue has no id) or updates issue draft
   * @param issue
   * @returns {Promise}
     */
  async updateIssueDraft(issue: IssueFull): IssueFull {
    const queryString = qs.stringify({fields: issueFields.singleIssue.toString()});

    const updatedIssue = await this.makeAuthorizedRequest(`${this.youTrackUrl}/api/admin/users/me/drafts/${issue.id || ''}?${queryString}`, 'POST', issue);
    updatedIssue.attachments = ApiHelper.convertRelativeUrls(issue.attachments, 'url', this.config.backendUrl);
    return updatedIssue;
  }

  async addComment(issueId: string, comment: string) {
    const queryString = qs.stringify({fields: issueFields.issueComment.toString()});
    const url = `${this.youTrackIssueUrl}/${issueId}/comments?${queryString}`;

    const createdComment =  await this.makeAuthorizedRequest(url, 'POST', {text: comment});
    createdComment.author.avatarUrl = handleRelativeUrl(createdComment.author.avatarUrl, this.config.backendUrl);

    return createdComment;
  }

  async getUserFromHub(id: string) {
    const queryString = qs.stringify({fields: 'avatar/url'});
    return await this.makeAuthorizedRequest(`${this.config.auth.serverUri}/api/rest/users/${id}?${queryString}`);
  }

  async getProjects(query: string) {
    const queryString = qs.stringify({
      fields: issueFields.projectOnList.toString(),
      query: query
    });
    return await this.makeAuthorizedRequest(`${this.youTrackProjectUrl}?${queryString}`);
  }

  async getProject(projectId: string) {
    const queryString = qs.stringify({
      fields: issueFields.project.toString()
    });
    return await this.makeAuthorizedRequest(`${this.youTrackProjectUrl}/${projectId}?${queryString}`);
  }

  async updateProject(issue: IssueOnList, project: IssueProject) {
    const body = {
      id: issue.id,
      project: project
    };
    return await this.makeAuthorizedRequest(`${this.youTrackIssueUrl}/${issue.id}`, 'POST', body);
  }

  async getCustomFieldValues(bundleId: string, fieldValueType: string) {
    const queryString = qs.stringify({
      fields: issueFields.bundle.toString()
    });

    const res = await this.makeAuthorizedRequest(`${this.youtTrackFieldBundleUrl}/${fieldValueType}/${bundleId}?${queryString}`);
    const values = res.aggregatedUsers || res.values;

    return ApiHelper.convertRelativeUrls(values, 'avatarUrl', this.config.backendUrl);
  }

  async getStateMachineEvents(issueId: string, fieldId: string) {
    const url = `${this.youTrackIssueUrl}/${issueId}/fields/${fieldId}/possibleEvents?fields=id,presentation`;
    return await this.makeAuthorizedRequest(url);
  }

  attachFile(issueId: string, fileUri: string, fileName: string) {
    const formDataContent = new FormData(); //eslint-disable-line no-undef
    // $FlowFixMe
    formDataContent.append('photo', {uri: fileUri, name: fileName, type: 'image/binary'});

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest(); //eslint-disable-line no-undef
      xhr.open('POST', `${this.youTrackUrl}/rest/issue/${issueId}/attachment`);

      xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4) {
          return;
        }
        if (xhr.status >= 200 && xhr.status < 400) {
          log.log('attach result', xhr);
          return resolve(xhr);
        }
        return reject(xhr);
      };
      xhr.send(formDataContent);
    });
  }

  async updateIssueSummaryDescription(issue: IssueFull) {
    const queryString = qs.stringify({fields: 'id,value'});
    const body = {summary: issue.summary, description: issue.description};

    return await this.makeAuthorizedRequest(`${this.youTrackIssueUrl}/${issue.id}?${queryString}`, 'POST', body);
  }

  async updateIssueFieldValue(issueId: string, fieldId: string, value: FieldValue) {
    const queryString = qs.stringify({fields: 'id,ringId,value'});
    const body = {id: fieldId, value};
    return await this.makeAuthorizedRequest(`${this.youTrackIssueUrl}/${issueId}/fields/${fieldId}?${queryString}`, 'POST', body);
  }

  async updateIssueFieldEvent(issueId: string, fieldId: string, event: Object) {
    const queryString = qs.stringify({fields: 'id,ringId,value'});
    const body = {id: fieldId, event};
    return await this.makeAuthorizedRequest(`${this.youTrackIssueUrl}/${issueId}/fields/${fieldId}?${queryString}`, 'POST', body);
  }

  async updateIssueStarred(issueId: string, hasStar: boolean) {
    return await this.makeAuthorizedRequest(`${this.youTrackIssueUrl}/${issueId}/watchers`, 'POST', {hasStar});
  }

  async updateIssueVoted(issueId: string, hasVote: boolean) {
    return await this.makeAuthorizedRequest(`${this.youTrackIssueUrl}/${issueId}/voters`, 'POST', {hasVote});
  }

  async getMentionSuggests(issueIds: Array<string>, query: string) {
    const $top = 10;
    const fields = 'issues(id),users(id,login,fullName,avatarUrl)';
    const queryString = qs.stringify({$top, fields, query});
    const body = {issues:  issueIds.map(id => ({id}))};
    const suggestions = await this.makeAuthorizedRequest(`${this.youTrackUrl}/api/mention?${queryString}`, 'POST', body);
    return ApiHelper.patchAllRelativeAvatarUrls(suggestions, this.config.backendUrl);
  }

  async getCommandSuggestions(issueIds: Array<string>, query: string, caret: number): Promise<CommandSuggestionResponse> {
    const queryString = qs.stringify({fields: issueFields.commandSuggestionFields.toString()});

    return await this.makeAuthorizedRequest(
      `${this.youTrackUrl}/api/commands/assist?${queryString}`,
      'POST',
      {
        query,
        caret,
        issues: issueIds.map(id => ({id}))
      }
    );
  }

  async applyCommand(options: {issueIds: Array<string>, comment?: ?string, command: string}): Promise<any> {
    return await this.makeAuthorizedRequest(`${this.youTrackUrl}/api/commands`, 'POST', {
      query: options.command,
      comment: options.comment,
      issues: options.issueIds.map(id => ({id}))
    });
  }

  //TODO: this is old API usage, move to new one
  async getQueryAssistSuggestions(query: string, caret: number): Promise<Array<TransformedSuggestion>> {
    const queryString = qs.stringify({query, caret});
    const result = await this.makeAuthorizedRequest(`${this.youTrackUrl}/rest/search/underlineAndSuggest?${queryString}`);

    return ApiHelper.convertQueryAssistSuggestions(result.suggest.items);
  }

  async getAgileUserProfile(): Promise<AgileUserProfile> {
    const queryString = qs.stringify({
      fields: agileFields.agileUserProfile.toString()
    });
    return await this.makeAuthorizedRequest(`${this.youTrackUrl}/api/agileUserProfile?${queryString}`);
  }

  async getSprint(boardId: string, sprintId: string, top: number = 100, skip: number = 0): Promise<SprintFull> {
    const queryString = qs.stringify({
      fields: agileFields.sprint.toString(),
      $topSwimlanes: top,
      $skipSwimlanes: skip
    }, {encode: false});
    const sprint = await this.makeAuthorizedRequest(`${this.youTrackUrl}/api/agiles/${boardId}/sprints/${sprintId}?${queryString}`);
    return ApiHelper.patchAllRelativeAvatarUrls(sprint, this.config.backendUrl);
  }

  async getSwimlanes(boardId: string, sprintId: string, top: number, skip: number = 0): Promise<Array<AgileBoardRow>> {
    const queryString = qs.stringify({
      fields: `trimmedSwimlanes(${agileFields.row.toString()})`,
      $topSwimlanes: top,
      $skipSwimlanes: skip
    });

    const board = await this.makeAuthorizedRequest(`${this.youTrackUrl}/api/agiles/${boardId}/sprints/${sprintId}/board?${queryString}`);
    const swimlanes = board.trimmedSwimlanes;
    return ApiHelper.patchAllRelativeAvatarUrls(swimlanes, this.config.backendUrl);
  }

  async updateRowCollapsedState(boardId: string, sprintId: string, row: Object): Promise<> {
    const isOrphan = row.id === 'orphans';
    const url = isOrphan ?
      `${this.youTrackUrl}/api/agiles/${boardId}/sprints/${sprintId}/board/orphanRow` :
      `${this.youTrackUrl}/api/agiles/${boardId}/sprints/${sprintId}/board/swimlanes/${row.id}`;

    return await this.makeAuthorizedRequest(`${url}`, 'POST', {
      $type: row.$type,
      id: isOrphan ? null : row.id,
      collapsed: row.collapsed
    });
  }

  async updateColumnCollapsedState(boardId: string, sprintId: string, column: Object): Promise<> {
    return await this.makeAuthorizedRequest(`${this.youTrackUrl}/api/agiles/${boardId}/sprints/${sprintId}/board/columns/${column.id}`,
    'POST',
    {
      collapsed: column.collapsed
    });
  }

  async getSprintList(boardId: string): Promise<> {
    const queryString = qs.stringify({
      fields: agileFields.sprintShort.toString()
    });
    return await this.makeAuthorizedRequest(`${this.youTrackUrl}/api/agiles/${boardId}/sprints?${queryString}`);
  }

  async getAgileBoardsList(): Promise<Array<BoardOnList>> {
    const queryString = qs.stringify({
      fields: agileFields.boardOnList.toString()
    });
    return await this.makeAuthorizedRequest(`${this.youTrackUrl}/api/agiles?${queryString}`);
  }

  async saveLastVisitedSprint(sprintId: string): Promise<> {
    return await this.makeAuthorizedRequest(`${this.youTrackUrl}/api/agileUserProfile`, 'POST', {
      visitedSprints: [{id: sprintId}]
    });
  }

  async getIssueDraftForAgileCell(boardId: string, sprintId: string, columnId: string, cellId: string): Promise<{id: string}> {
    const queryString = qs.stringify({fields: 'id'});
    const url =`${this.youTrackUrl}/api/agiles/${boardId}/sprints/${sprintId}/board/columns/${columnId}/cells/${cellId}/draftIssue?${queryString}`;
    return await this.makeAuthorizedRequest(url, 'POST', {});
  }
}

/**
 * https://youtrack.jetbrains.com/issue/YTM-261
 * http://www.mytecbits.com/microsoft/iis/iis-changing-maxquerystring-and-maxurl
 */
function assertLongQuery(url: string) {
  const [, ...queryParts] = url.split('?');
  const query = queryParts.join('');
  if (query.length > MAX_QUERY_LENGTH) {
    log.warn(`Query length (${query.length}) is longer than ${MAX_QUERY_LENGTH}. This doesn't work on some servers`, url);
  }
}

export default Api;
