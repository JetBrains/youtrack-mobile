const exec = require('child_process').exec;

const BUILD_NUMBER = process.env.buildNumber || 2222.2;
const VERSION_NUMBER = process.env.versionNumber || 7777;

if (!BUILD_NUMBER || !VERSION_NUMBER) {
  console.error('process.env', process.env); //eslint-disable-line
  throw new Error('`versionNumber` and `buildNumber` are required.');
}

console.log(`Setting version and build number in Xcode project: Marketing = ${VERSION_NUMBER}, build number = ${BUILD_NUMBER}`);//eslint-disable-line

exec(
  `cd ios && agvtool new-marketing-version ${VERSION_NUMBER} && agvtool new-version -all ${BUILD_NUMBER}`,
  function reporter(error, stdout) {
    if (error) {
      throw error;
    }
    console.log(stdout);//eslint-disable-line
  }
);

