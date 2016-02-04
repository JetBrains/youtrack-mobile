const YouTrackUrl = 'http://ring-demo-dev.labs.intellij.net/youtrack';
const YouTrackIssueUrl = `${YouTrackUrl}/rest/issue/`;
const YouTrackIssuesUrl = `${YouTrackUrl}/rest/issue?useImplicitSort=true&with=summary&with=resolved&with=priority&with=reporterFullName&with=assignee`;
const YouTrackIssuesFolderUrl = `${YouTrackUrl}/rest/issuesFolder`;
const YouTrackUserUrl = `${YouTrackUrl}/rest/admin/user/`;

class Api {
    constructor(auth) {
        this.auth = auth;
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
                return res.json();
            });
    }

    getIssue(id) {
        const url = YouTrackIssueUrl + id;
        return this.makeAuthorizedRequest(url);
            //.then(res => res.issue)
    }

    getIssues(filter = '', count, skip = 0) {
        const url = `${YouTrackIssuesUrl}&max=${count}&after=${skip}&filter=${encodeURIComponent(filter || '')}`;
        return this.makeAuthorizedRequest(url)
            .then(res => res.issue)
    }

    getIssueFolders() {
        return this.makeAuthorizedRequest(YouTrackIssuesFolderUrl);
    }

    addComment(issueId, comment) {
        let url = `${YouTrackIssueUrl}${issueId}/execute?comment=${encodeURIComponent(comment)}`;
        return this.makeAuthorizedRequest(url, 'POST');
    }

    getUser(login) {
        return this.makeAuthorizedRequest(YouTrackUserUrl + encodeURIComponent(login));
    }

    getUserFromHub(hubUrl, id) {
        return this.makeAuthorizedRequest(`${hubUrl}/api/rest/users/${id}?fields=avatar%2Furl`);
    }
}

module.exports = Api;