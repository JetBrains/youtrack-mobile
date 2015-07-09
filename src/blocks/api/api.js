const YouTrackIssuesUrl = 'http://hackathon15.labs.intellij.net:8080/youtrack/rest/issue';

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

    getIssues() {
        return this.makeAuthorizedRequest(YouTrackIssuesUrl)
            .then(res => res.issue)
    }
}

module.exports = Api;