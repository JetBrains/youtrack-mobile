const pkg = require('../package.json'); //eslint-disable-line


if (hasExceptionReporterToken() || hasAnalyticsId() || hasKonnektorData()) {
  throw new Error('`Config` or `Google Services` is touched. Revert changes and proceed.');
}


function hasExceptionReporterToken() {
  return isNotEmpty(pkg.config.EXCEPTION_REPORTER_TOKEN);
}

function hasAnalyticsId() {
  return isNotEmpty(pkg.config.ANALYTICS_ID);
}

function hasKonnektorData() {
  return isNotEmpty(pkg.config.KONNECTOR_URL);
}

function isNotEmpty(param) {
  return param.trim().length > 0;
}
