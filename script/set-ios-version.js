const exec = require('child_process').exec;

const env = process.env;
const version = require('../package.json').version.split('-');

const BUILD_NUMBER = env.buildNumber || version[1] || 9999;
const VERSION_NUMBER = env.versionNumber || version[0] || 1;

if (!BUILD_NUMBER || !VERSION_NUMBER) {
  // eslint-disable-next-line no-console
  console.error('process.env', env);
  throw new Error('`versionNumber` and `buildNumber` are required.');
}

// eslint-disable-next-line no-console
console.log(
  (BUILD_NUMBER < 1 ? '\x1b[31m' : '\x1b[32m'),
  `Update version and build number in Xcode project: Marketing = ${VERSION_NUMBER}, build number = ${BUILD_NUMBER}`,
  '\x1b[0m'
);

exec(
  `cd ios && agvtool new-marketing-version ${VERSION_NUMBER} && agvtool new-version -all ${BUILD_NUMBER}`,
  function reporter(error, stdout) {
    if (error) {
      throw error;
    }
    // eslint-disable-next-line no-console
    console.log(stdout);
  }
);

