const YouTrackUrl = 'https://youtrack.jetbrains.com';
const YouTrackIssueUrl = YouTrackUrl + '/rest/issue/';
const YouTrackIssuesUrl = YouTrackUrl + '/rest/issue?max=100&useImplicitSort=true&with=summary&with=resolved&with=priority&with=reporterFullName&with=assignee';
const YouTrackIssuesFolderUrl = YouTrackUrl + '/rest/issuesFolder';
const YouTrackUserUrl = YouTrackUrl + '/rest/admin/user/';

class Api {
    constructor(auth) {
        this.auth = auth;
    }

    makeAuthorizedRequest(url, method = 'GET') {
        let authParams = this.auth.authParams;
        return fetch(url, {
            method,
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Authorization': `${authParams.token_type} ${authParams.access_token}`
            }
        })
            //Handle access_token expiring: refresh it in that case
            .then(res => {
                if (res.status === 401) {
                    //TODO: may freeze here
                    return this.auth.refreshToken()
                        .then(() => this.makeAuthorizedRequest(url, method));
                }
                return res;
            })
            .then(res => {
                if (res.status > 401) {
                    throw JSON.parse(res._bodyText);
                }
                return res.json();
            });
    }

    getIssue(id) {
        var url = YouTrackIssueUrl + id;
        return this.makeAuthorizedRequest(url);
            //.then(res => res.issue)
    }

    getIssues(filter = '') {
        var url = YouTrackIssuesUrl + '&filter=' + encodeURIComponent(filter);
        return this.makeAuthorizedRequest(url)
            .then(res => res.issue)
    }

    getIssueFolders() {
        return this.makeAuthorizedRequest(YouTrackIssuesFolderUrl);
    }

    addComment(issueId, comment) {
        let url = YouTrackIssueUrl + issueId + '/execute?comment=' + encodeURIComponent(comment);
        return this.makeAuthorizedRequest(url, 'POST');
    }

    getUser(login) {
        return this.makeAuthorizedRequest(YouTrackUserUrl + encodeURIComponent(login));
    }

    getUserFromHub(hubUrl, id) {
        return this.makeAuthorizedRequest(hubUrl + `/api/rest/users/${id}?fields=avatar%2Furl`);
    }
}

module.exports = Api;