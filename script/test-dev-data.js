const pkg = require('../package.json'); //eslint-disable-line


if (hasExceptionReporterToken() || hasAnalyticsId() || hasKonnektorData() || hasBugsnagData()) {
  throw new Error('`Config` or `Bugsnag Config` or `Google Services` is touched. Revert changes and proceed.');
}


function hasExceptionReporterToken() {
  return isNotEmpty(pkg.config.EXCEPTION_REPORTER_TOKEN);
}

function hasAnalyticsId() {
  return isNotEmpty(pkg.config.ANALYTICS_ID);
}

function hasKonnektorData() {
  return pkg.config.KONNECTOR_URL !== 'https://konnector-staging.services.jetbrains.com';
}

function hasBugsnagData() {
  return isNotEmpty(pkg.bugsnag.token);
}

function isNotEmpty(param) {
  return param.trim().length > 0;
}
