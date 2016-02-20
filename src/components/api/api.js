import qs from 'qs';

class Api {
  constructor(auth) {
    this.auth = auth;
    this.config = auth.config;

    this.youTrackUrl = this.config.backendUrl;
    this.youTrackIssueUrl = `${this.youTrackUrl}/rest/issue/`;
    this.youTrackIssuesFolderUrl = `${this.youTrackUrl}/rest/issuesFolder`;
    this.youTrackUserUrl = `${this.youTrackUrl}/rest/admin/user/`;
  }

  makeAuthorizedRequest(url, method = 'GET') {

    let sendRequest = () => {
      let authParams = this.auth.authParams;

      return fetch(url, {
        method,
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Authorization': `${authParams.token_type} ${authParams.access_token}`
        }
      });
    };

    return sendRequest()
    //Handle access_token expiring: refresh it in that case and resend request
      .then(res => {
        if (res.status === 401 || res._bodyText.indexOf('Token expired') !== -1) {
          console.info('Looks like the token is expired, will try to refresh', res);
          return this.auth.refreshToken()
            .then(sendRequest);
        }
        return res;
      })
      .then(res => {
        if (res.status > 401) {
          throw JSON.parse(res._bodyText);
        }

        if (res.status === 201 && !res._bodyText) {
          return 'Created';
        }

        if (res.status === 200 && res.url.indexOf('execute') !== -1 && res.ok === true) {
          return 'Command executed';
        }

        return res.json();
      });
  }

  getIssue(id) {
    return this.makeAuthorizedRequest(this.youTrackIssueUrl + id);
    //.then(res => res.issue)
  }

  getIssues(filter = '', count, skip = 0) {
    const queryString = qs.stringify({
      useImplicitSort: true,
      with: ['summary', 'resolved', 'priority', 'reporterFullName', 'assignee'],

      max: count,
      after: skip,
      filter: filter
    }, {indices: false});

    return this.makeAuthorizedRequest(`${this.youTrackIssueUrl}?${queryString}`)
      .then(res => res.issue)
  }

  getIssueFolders() {
    return this.makeAuthorizedRequest(this.youTrackIssuesFolderUrl);
  }

  createIssue(issue) {
    const queryString = qs.stringify({
      project: issue.project,
      summary: issue.summary,
      description: issue.description
    });

    const url = `${this.youTrackIssueUrl}?${queryString}`;

    return this.makeAuthorizedRequest(url, 'PUT');
  }

  addComment(issueId, comment) {
    const queryString = qs.stringify({comment});
    const url = `${this.youTrackIssueUrl}${issueId}/execute?${queryString}`;
    return this.makeAuthorizedRequest(url, 'POST');
  }

  getUser(login) {
    return this.makeAuthorizedRequest(this.youTrackUserUrl + encodeURIComponent(login));
  }

  getUserFromHub(id) {
    const queryString = qs.stringify({fields: 'avatar/url'});

    return this.makeAuthorizedRequest(`${this.config.auth.serverUri}/api/rest/users/${id}?${queryString}`);
  }
}

module.exports = Api;
