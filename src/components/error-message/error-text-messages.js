/* @flow */

const LOG_IN_2FA_TIP = 'Use "Log in via Browser" if 2FA is enabled.';

const NETWORK_PROBLEM_TIPS = [
  '\nMake sure that your YouTrack instance is available.',
  'URL address should match the formats:\n • youtrack-example.com:PORT\n • XX.XX.XX.XXX:PORT',
  '\nClient certificate authentication is not supported.',
];

const YT_SUPPORTED_VERSION = `YouTrack Mobile requires YouTrack version 2016.2 or later.`;

/* eslint-disable import/no-commonjs */
module.exports = {
  LOG_IN_2FA_TIP: LOG_IN_2FA_TIP,
  NETWORK_PROBLEM_TIPS: NETWORK_PROBLEM_TIPS.join('\n'),
  YT_SUPPORTED_VERSION: YT_SUPPORTED_VERSION
};
