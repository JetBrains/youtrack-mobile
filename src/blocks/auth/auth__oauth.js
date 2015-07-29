var config = require('../app/app__config');
var LinkingIOS = require('react-native').LinkingIOS;
var shittyQs = require('shitty-qs');
var btoa = require('btoa');

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
                `http://hackathon15.labs.intellij.net:8080/hub/api/rest/oauth2/token`,
                '?grant_type=authorization_code',
                `&code=${code}`,
                `&client_id=${config.auth.clientId}`,
                `&client_secret=${config.auth.clientSecret}`,
                `&redirect_uri=${config.auth.landingUrl}`
            ].join(''), {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${btoa(`${config.auth.clientId}:${config.auth.clientSecret}`)}`
                }
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