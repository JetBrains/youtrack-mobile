const exec = require('child_process').exec;

const npmPackageVersion = process.env.npm_package_version;

const versionParts = npmPackageVersion.split('.');
const major = versionParts[0];
const minor = versionParts[1];
const patch = versionParts[2];

const minorPartOfMarketing = minor === '0' ? '' : `.${minor}`;

const marketingVersion = `${major}${minorPartOfMarketing}`;
const buildNumber = patch;

function reporter(error, stdout) {
  if (error) {
    throw error;
  }
  console.log(stdout);
}

exec(`cd ios && agvtool new-marketing-version ${marketingVersion} && agvtool new-version -all ${buildNumber}`, reporter);
