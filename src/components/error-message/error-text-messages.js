/* @flow */

const LOG_IN_2FA_TIP = 'If you have enabled 2-factor authentication, use the "Log in with Browser" option.';

const NETWORK_PROBLEM_TIPS = [
  'Make sure that your YouTrack installation is accessible over the internet.',
  'If your YouTrack installation is hosted on a web server from a non-standard port (like 80 for HTTP or 443 for HTTPS), include the port number after the URL: youtrack-example.com:PORT',
  'Connections to servers that use self-signed SSL/TLS certificates are not supported.',
];

const YT_SUPPORTED_VERSION = 'YouTrack Mobile requires YouTrack version 2018+.';

/* eslint-disable import/no-commonjs */
module.exports = {
  LOG_IN_2FA_TIP: LOG_IN_2FA_TIP,
  NETWORK_PROBLEM_TIPS: NETWORK_PROBLEM_TIPS,
  YT_SUPPORTED_VERSION: YT_SUPPORTED_VERSION,
};
