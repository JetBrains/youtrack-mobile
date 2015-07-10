const YouTrackUrl = 'http://hackathon15.labs.intellij.net:8080/youtrack';
const YouTrackIssueUrl = YouTrackUrl + '/rest/issue/';
const YouTrackIssuesUrl = YouTrackUrl + '/rest/issue?max=100&useImplicitSort=true&with=summary&with=resolved&with=priority&with=reporterFullName&with=assignee';
const YouTrackIssuesFolderUrl = YouTrackUrl + '/rest/issuesFolder';

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
            .then(function (res) {
                if (res.status > 400) {
                    throw JSON.parse(res._bodyText);
                }
                return res.json();
            });
    }

    getIssue(id) {
        var url = YouTrackIssueUrl + id;
        return this.makeAuthorizedRequest(url)
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

    getUser(hubUrl, name) {
        return this.makeAuthorizedRequest(hubUrl + '/api/rest/users/byname/' + encodeURIComponent(name)  + '?fields=avatar%2Furl');
    }
}

module.exports = Api;