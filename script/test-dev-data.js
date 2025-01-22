const pkg = require('../package.json');
const fg = require('fast-glob');
const fs = require('fs');

if (hasExceptionReporterToken() || hasAnalyticsId() || hasKonnektorData() || hasBugsnagData()) {
  throw new Error('`Config` or `Bugsnag Config` or `Google Services` is touched. Revert changes and proceed.');
}

checkIfLogsIgnored();

function hasExceptionReporterToken() {
  return isNotEmpty(pkg.config.EXCEPTION_REPORTER_TOKEN);
}

function hasAnalyticsId() {
  return isNotEmpty(pkg.config.ANALYTICS_ID);
}

function hasKonnektorData() {
  return isNotEmpty(pkg.config.KONNECTOR_URL);
}

function hasBugsnagData() {
  return isNotEmpty(pkg.bugsnag.token);
}

function isNotEmpty(param) {
  return param.trim().length > 0;
}

function checkIfLogsIgnored() {
  const filePath = './src/app.tsx';
  const searchText = 'LogBox.ignoreAllLogs()';

  fg([filePath]).then((files) => {
    if (files.length === 0) {
      throw new Error(`❌ File "${filePath}" not found.`);
    }
    const fileContent = fs.readFileSync(files[0], 'utf8');
    if (fileContent.includes(searchText)) {
      throw new Error(`❌ The file "${filePath}" contains the text: "${searchText}".`);
    }
  });
}
