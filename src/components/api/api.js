/* @flow */
import qs from 'qs';
import fields from './api__fields';
import Auth from '../auth/auth';
import log from '../log/log';
import {handleEmbeddedHubUrl} from '../config/config';

class Api {
  auth: Auth;
  config: AppConfigFilled;
  youTrackUrl: string;
  youTrackIssueUrl: string;
  youTrackProjectUrl: string;
  youTrackIssuesFolderUrl: string;
  youtTrackFieldBundleUrl: string;

  constructor(auth: Object) {
    this.auth = auth;
    this.config = auth.config;

    this.youTrackUrl = this.config.backendUrl;
    this.youTrackIssueUrl = `${this.youTrackUrl}/api/issues`;
    this.youTrackProjectUrl =`${this.youTrackUrl}/api/admin/projects`;
    this.youTrackIssuesFolderUrl = `${this.youTrackUrl}/api/issueFolders`;

    this.youtTrackFieldBundleUrl = `${this.youTrackUrl}/api/admin/customFieldSettings/bundles`;
  }

  makeAuthorizedRequest(url: string, method: ?string, body: ?Object) {
    const sendRequest = () => {
      const authParams = this.auth.authParams;
      if (!authParams) {
        throw new Error('Using API with uninitializard Auth');
      }

      return fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/plain, */*',
          'Authorization': `${authParams.token_type} ${authParams.access_token}`
        },
        body: JSON.stringify(body)
      });
    };

    return sendRequest()
      .then(res => {
        if (res.status === 401) {
          log.info('Looks like the token is expired, will try to refresh', res);
          return this.auth.refreshToken()
            .then(sendRequest);
        }
        return res;
      })
      .then(res => {
        if (res.status < 200 || res.status > 300) {
          throw res;
        }
        return res.json();
      });
  }

  hackishGetIssueByIssueReadableId(issueId: string) {
    const queryString = qs.stringify({
      query: `issue id: ${issueId}`,
      $top: 1,
      fields: fields.singleIssue.toString()
    });
    return this.makeAuthorizedRequest(`${this.youTrackIssueUrl}?${queryString}`)
      .then(issues => issues[0]);
  }

  async getIssue(id: string) {
    const queryString = qs.stringify({
      fields: fields.singleIssue.toString()
    });

    const issue = await this.makeAuthorizedRequest(`${this.youTrackIssueUrl}/${id}?${queryString}`);

    issue.comments.forEach(comment => {
      comment.author.avatarUrl = handleEmbeddedHubUrl(comment.author.avatarUrl, this.config.backendUrl);
    });

    return issue;
  }

  getIssues(query: string = '', $top: number, $skip: number = 0) {
    const queryString = qs.stringify({
      query, $top, $skip,
      fields: fields.issuesOnList.toString()
    });

    return this.makeAuthorizedRequest(`${this.youTrackIssueUrl}?${queryString}`);
  }

  getIssueFolders() {
    return this.makeAuthorizedRequest(`${this.youTrackIssuesFolderUrl}?fields=$type,name,query`);
  }

  createIssue(issueDraft: IssueOnList) {
    log.info('Issue draft to create:', issueDraft);
    const queryString = qs.stringify({
      draftId: issueDraft.id,
      fields: fields.issuesOnList.toString()
    });
    return this.makeAuthorizedRequest(`${this.youTrackIssueUrl}?${queryString}`, 'POST', {});
  }

  loadIssueDraft(draftId: string) {
    const queryString = qs.stringify({fields: fields.singleIssue.toString()});
    return this.makeAuthorizedRequest(`${this.youTrackUrl}/api/admin/users/me/drafts/${draftId}?${queryString}`);
  }

  /**
   * Creates (if issue has no id) or updates issue draft
   * @param issue
   * @returns {Promise}
     */
  updateIssueDraft(issue: IssueFull) {
    const queryString = qs.stringify({fields: fields.singleIssue.toString()});

    return this.makeAuthorizedRequest(`${this.youTrackUrl}/api/admin/users/me/drafts/${issue.id || ''}?${queryString}`, 'POST', issue);
  }

  addComment(issueId: string, comment: string) {
    const queryString = qs.stringify({fields: fields.issueComment.toString()});
    const url = `${this.youTrackIssueUrl}/${issueId}/comments?${queryString}`;

    return this.makeAuthorizedRequest(url, 'POST', {text: comment});
  }

  getUserFromHub(id: string) {
    const queryString = qs.stringify({fields: 'avatar/url'});
    return this.makeAuthorizedRequest(`${this.config.auth.serverUri}/api/rest/users/${id}?${queryString}`);
  }

  getProjects(query: string) {
    const queryString = qs.stringify({
      fields: fields.projectOnList.toString(),
      query: query
    });
    return this.makeAuthorizedRequest(`${this.youTrackProjectUrl}?${queryString}`);
  }

  getProject(projectId: string) {
    const queryString = qs.stringify({
      fields: fields.project.toString()
    });
    return this.makeAuthorizedRequest(`${this.youTrackProjectUrl}/${projectId}?${queryString}`);
  }

  updateProject(issue: IssueOnList, project: IssueProject) {
    const body = {
      id: issue.id,
      project: project
    };
    return this.makeAuthorizedRequest(`${this.youTrackIssueUrl}/${issue.id}`, 'POST', body);
  }

  getCustomFieldValues(bundleId: string, fieldValueType: string) {
    const queryString = qs.stringify({
      fields: fields.bundle.toString()
    });
    return this.makeAuthorizedRequest(`${this.youtTrackFieldBundleUrl}/${fieldValueType}/${bundleId}?${queryString}`);
  }

  getStateMachineEvents(issueId: string, fieldId: string) {
    const url = `${this.youTrackIssueUrl}/${issueId}/fields/${fieldId}/possibleEvents?fields=id,presentation`;
    return this.makeAuthorizedRequest(url);
  }

  attachFile(issueId: string, fileUri: string, fileName: string) {
    const formDataContent = new FormData(); //eslint-disable-line no-undef
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

  updateIssueSummaryDescription(issue: IssueFull) {
    const queryString = qs.stringify({fields: 'id,value'});
    const body = {summary: issue.summary, description: issue.description};

    return this.makeAuthorizedRequest(`${this.youTrackIssueUrl}/${issue.id}?${queryString}`, 'POST', body);
  }

  updateIssueFieldValue(issueId: string, fieldId: string, value: FieldValue) {
    const queryString = qs.stringify({fields: 'id,ringId,value'});
    const body = {id: fieldId, value};
    return this.makeAuthorizedRequest(`${this.youTrackIssueUrl}/${issueId}/fields/${fieldId}?${queryString}`, 'POST', body);
  }

  updateIssueFieldEvent(issueId: string, fieldId: string, event: Object) {
    const queryString = qs.stringify({fields: 'id,ringId,value'});
    const body = {id: fieldId, event};
    return this.makeAuthorizedRequest(`${this.youTrackIssueUrl}/${issueId}/fields/${fieldId}?${queryString}`, 'POST', body);
  }

  getMentionSuggests(issueIds: Array<string>, query: string) {
    const $top = 10;
    const fields = 'issues(id),users(id,login,fullName,avatarUrl)';
    const queryString = qs.stringify({$top, fields, query});
    const body = {issues:  issueIds.map(id => ({id}))};

    return this.makeAuthorizedRequest(`${this.youTrackUrl}/api/mention?${queryString}`, 'POST', body);
  }

  //TODO: this is old API usage, move to new one
  getQueryAssistSuggestions(query: string, caret: number) {
    const queryString = qs.stringify({query, caret});
    return this.makeAuthorizedRequest(`${this.youTrackUrl}/rest/search/underlineAndSuggest?${queryString}`);
  }
}

export default Api;
