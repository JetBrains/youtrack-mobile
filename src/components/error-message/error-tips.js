/* @flow */

const LOG_IN_2FA_TIP = 'Use Log in via Browser if 2FA is enabled.';

const NETWORK_PROBLEM_TIPS = [
  '\nMake sure that your YouTrack instance is available.',
  'URL address should match formats:\n • youtrack-example.com:PORT\n • XX.XX.XX.XXX:PORT'
];


/* eslint-disable import/no-commonjs */
module.exports = {
  LOG_IN_2FA_TIP: LOG_IN_2FA_TIP,
  NETWORK_PROBLEM_TIPS: NETWORK_PROBLEM_TIPS
};
