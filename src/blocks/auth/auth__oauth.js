var config = require('../app/app__config');
var LinkingIOS = require('react-native').LinkingIOS;
var shittyQs = require('shitty-qs');

function openAuthPage() {
    LinkingIOS.openURL([
        `${config.auth.serverUri}/auth/login`,
        '?response_type=code',
        `&client_id=${config.auth.clientId}`,
        `&scope=${config.auth.scopes}`,
        `&redirect_uri=${config.auth.landingUrl}`
    ].join(''));
}

function hubOAuth() {
    return new Promise(function (resolve, reject) {

        LinkingIOS.addEventListener('url', function (event) {
            var [, query_string] = event.url.match(/\?(.*)/);
            let code = shittyQs(query_string).code;

            fetch([
                `http://hackathon15.labs.intellij.net:8080/hub/auth/token`,
                '?grant_type=authorization_code',
                `&client_id=${config.auth.clientId}`,
                `&scope=${config.auth.scopes}`,
                `&code=${code}`,
                `&redirect_uri=${config.auth.landingUrl}`
            ].join(''), {
                //method: 'POST'
            }).then(res => {
                debugger;
            }).catch(err => {
                debugger;
            });
            //resolve(shittyQs(query_string));
        });

        openAuthPage();
    });
}

module.exports = hubOAuth;