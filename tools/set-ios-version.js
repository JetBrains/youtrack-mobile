const exec = require('child_process').exec;

const npmPackageVersion = process.env.npm_package_version;
const splitRegExp = /[\.-]/i;

const versionParts = npmPackageVersion.split(splitRegExp);
const major = versionParts[0];
const minor = versionParts[1];
const patch = versionParts[2];
const buildNumber = versionParts[3];
const patchPart = parseInt(patch) === 0 ? '' : `.${patch}`;

const marketingVersion = `${major}.${minor}${patchPart}`;

function reporter(error, stdout) {
  if (error) {
    throw error;
  }
  console.log(stdout);
}

console.log(`Setting iOS version. Marketing = ${marketingVersion}, build number = ${buildNumber}`);

exec(`cd ios && agvtool new-marketing-version ${marketingVersion} && agvtool new-version -all ${buildNumber}`, reporter);
