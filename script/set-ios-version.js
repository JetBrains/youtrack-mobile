const exec = require('child_process').exec;

const BUILD_NUMBER = process.env.buildNumber || 0.1;
const VERSION_NUMBER = process.env.versionNumber || 1;

if (!BUILD_NUMBER || !VERSION_NUMBER) {
  console.error('process.env', process.env); //eslint-disable-line
  throw new Error('`versionNumber` and `buildNumber` are required.');
}

console.log( //eslint-disable-line
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
    console.log(stdout);//eslint-disable-line
  }
);

