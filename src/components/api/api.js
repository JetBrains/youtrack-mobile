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
    let sendRequest = () => {
      let authParams = this.auth.authParams;

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
        if (res.status === 401 || (res._bodyText && res._bodyText.indexOf('Token expired') !== -1)) {
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
    return this.makeAuthorizedRequest(`${this.youTrackIssuesFolderUrl}?fields=name,query`);
  }

  createIssue(issue) {
    console.info('ISSUE TO CREATE>>>', issue)
    return this.makeAuthorizedRequest(this.youTrackIssueUrl, 'POST', issue);
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

  getCustomFieldValues(bundleId, fieldType) {
    const queryString = qs.stringify({
      fields: fields.bundle.toString()
    });
    return this.makeAuthorizedRequest(`${this.youtTrackFieldBundleUrl}/${fieldType}/${bundleId}?${queryString}`);
  }

  updateIssueFieldValue(issueId, field) {
    const queryString = qs.stringify({fields: 'id,ringId,value'});
    return this.makeAuthorizedRequest(`${this.youTrackIssueUrl}/${issueId}/fields/${field.id}?${queryString}`, 'POST', field);
  }
}

module.exports = Api;
