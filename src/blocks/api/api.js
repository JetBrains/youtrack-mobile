const YouTrackIssuesUrl = 'http://hackathon15.labs.intellij.net:8080/youtrack/rest/issue?max=100&useImplicitSort=true&with=summary&with=resolved&with=priority&with=reporterFullName&with=assignee';

class Api {
    constructor(auth) {
        this.auth = auth;
    }

    makeAuthorizedRequest(url, method = 'GET') {
        let authParams = this.auth.authParams;
        return fetch(url, {
            credentials: 'cors',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Authorization': `${authParams.token_type} ${authParams.access_token}`
            }
        })
            .then(function (res) {
                return res.json();
            });
    }

    getIssues(filter = '') {
        var url = YouTrackIssuesUrl + '&filter=' + filter;
        return this.makeAuthorizedRequest(url)
            .then(res => res.issue)
    }
}

module.exports = Api;