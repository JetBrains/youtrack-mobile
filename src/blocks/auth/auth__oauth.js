var config = require('../app/app__config');
var LinkingIOS = require('react-native').LinkingIOS;
var shittyQs = require('shitty-qs');
var base64 = require('base64-js');

function openAuthPage() {
    LinkingIOS.openURL([
        `${config.auth.serverUri}/auth/login`,
        '?response_type=code',
        '&access_type=offline',
        `&client_id=${config.auth.clientId}`,
        `&scope=${config.auth.scopes}`,
        `&redirect_uri=${config.auth.landingUrl}`
    ].join(''));
}

function btoa(str) {
    let byteArray = [];
    for (var i = 0; i < str.length; i++) {
        byteArray.push(str.charCodeAt(i));
    }
    return base64.fromByteArray(byteArray);
}

function hubOAuth2() {
    return new Promise(function (resolve, reject) {

        LinkingIOS.addEventListener('url', function (event) {
            var [, query_string] = event.url.match(/\?(.*)/);
            let code = shittyQs(query_string).code;
            resolve(code);
        });

        openAuthPage();
    });
}

module.exports = hubOAuth2;