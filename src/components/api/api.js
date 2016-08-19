import qs from 'qs';
import fields from './api__fields';

class Api {
  constructor(auth) {
    this.auth = auth;
    this.config = auth.config;

    this.youTrackUrl = this.config.backendUrl;
    this.youTrackIssueUrl = `${this.youTrackUrl}/api/issues`;
    this.youTrackProjectUrl =`${this.youTrackUrl}/api/admin/projects`;
    this.youTrackIssuesFolderUrl = `${this.youTrackUrl}/api/issueFolders`;

    this.youtTrackFieldBundleUrl = `${this.youTrackUrl}/api/admin/customFieldSettings/bundles`;
  }

  makeAuthorizedRequest(url, method, body) {
    const sendRequest = () => {
      const authParams = this.auth.authParams;

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
          console.info('Looks like the token is expired, will try to refresh', res);
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

  hackishGetIssueByIssueReadableId(issueId) {
    const queryString = qs.stringify({
      query: `issue id: ${issueId}`,
      $top: 1,
      fields: fields.singleIssue.toString()
    });
    return this.makeAuthorizedRequest(`${this.youTrackIssueUrl}?${queryString}`)
      .then(issues => issues[0]);
  }

  getIssue(id) {
    const queryString = qs.stringify({
      fields: fields.singleIssue.toString()
    });
    return this.makeAuthorizedRequest(`${this.youTrackIssueUrl}/${id}?${queryString}`);
  }

  getIssues(query = '', $top, $skip = 0) {
    const queryString = qs.stringify({
      query, $top, $skip,
      fields: fields.issuesOnList.toString()
    });

    return this.makeAuthorizedRequest(`${this.youTrackIssueUrl}?${queryString}`);
  }

  getIssueFolders() {
    return this.makeAuthorizedRequest(`${this.youTrackIssuesFolderUrl}?fields=$type,name,query`);
  }

  createIssue(issueDraft) {
    console.info('Issue draft to create:', issueDraft);
    const queryString = qs.stringify({
      draftId: issueDraft.id,
      fields: fields.issuesOnList.toString()
    });
    return this.makeAuthorizedRequest(`${this.youTrackIssueUrl}?${queryString}`, 'POST', {});
  }

  /**
   * Creates (if issue has no id) or updates issue draft
   * @param issue
   * @returns {Promise}
     */
  updateIssueDraft(issue) {
    const queryString = qs.stringify({
      fields: fields.singleIssue.toString(),
      tmp: true
    });

    return this.makeAuthorizedRequest(`${this.youTrackUrl}/api/admin/users/me/drafts/${issue.id || ''}?${queryString}`, 'POST', issue);
  }

  addComment(issueId, comment) {
    const url = `${this.youTrackIssueUrl}/${issueId}/comments`;
    return this.makeAuthorizedRequest(url, 'POST', {text: comment});
  }

  getUserFromHub(id) {
    const queryString = qs.stringify({fields: 'avatar/url'});

    return this.makeAuthorizedRequest(`${this.config.auth.serverUri}/api/rest/users/${id}?${queryString}`);
  }

  getProjects(query) {
    const queryString = qs.stringify({
      fields: fields.projectOnList.toString(),
      query: query
    });
    return this.makeAuthorizedRequest(`${this.youTrackProjectUrl}?${queryString}`);
  }

  getProject(projectId) {
    const queryString = qs.stringify({
      fields: fields.project.toString()
    });
    return this.makeAuthorizedRequest(`${this.youTrackProjectUrl}/${projectId}?${queryString}`);
  }

  updateProject(issue, project) {
    const body = {
      id: issue.id,
      project: project
    };
    return this.makeAuthorizedRequest(`${this.youTrackIssueUrl}/${issue.id}`, 'POST', body);
  }

  getCustomFieldValues(bundleId, fieldType) {
    const queryString = qs.stringify({
      fields: fields.bundle.toString()
    });
    return this.makeAuthorizedRequest(`${this.youtTrackFieldBundleUrl}/${fieldType}/${bundleId}?${queryString}`);
  }

  getStateMachineEvents(issueId, fieldId) {
    const url = `${this.youTrackIssueUrl}/${issueId}/fields/${fieldId}/possibleEvents?fields=id,presentation`;
    return this.makeAuthorizedRequest(url);
  }

  attachFile(issueId, fileUri, fileName) {
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
          console.log('attach result', xhr);
          return resolve(xhr);
        }
        return reject(xhr);
      };
      xhr.send(formDataContent);
    });
  }

  updateIssueSummaryDescription(issue) {
    const queryString = qs.stringify({fields: 'id,value'});
    const body = {summary: issue.summary, description: issue.description};

    return this.makeAuthorizedRequest(`${this.youTrackIssueUrl}/${issue.id}?${queryString}`, 'POST', body);
  }

  updateIssueFieldValue(issueId, fieldId, value) {
    const queryString = qs.stringify({fields: 'id,ringId,value'});
    const body = {id: fieldId, value};
    return this.makeAuthorizedRequest(`${this.youTrackIssueUrl}/${issueId}/fields/${fieldId}?${queryString}`, 'POST', body);
  }

  updateIssueFieldEvent(issueId, fieldId, event) {
    const queryString = qs.stringify({fields: 'id,ringId,value'});
    const body = {id: fieldId, event};
    return this.makeAuthorizedRequest(`${this.youTrackIssueUrl}/${issueId}/fields/${fieldId}?${queryString}`, 'POST', body);
  }

  //TODO: this is old API usage
  getQueryAssistSuggestions(query, caret) {
    const queryString = qs.stringify({query, caret});
    return this.makeAuthorizedRequest(`${this.youTrackUrl}/rest/search/underlineAndSuggest?${queryString}`);
  }
}

module.exports = Api;
