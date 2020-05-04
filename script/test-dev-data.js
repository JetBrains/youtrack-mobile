const pkg = require('../package.json'); //eslint-disable-line


if (hasExceptionReporterToken() || hasAnalyticsId() || hasKonnektorData() || hasGoogleServicesData() || hasBugsnagData()) {
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

function hasGoogleServicesData() {
  const googleServicesData = require('../android/app/google-services');
  return (
    isNotEmpty(googleServicesData.project_info.project_number)||
    isNotEmpty(googleServicesData.project_info.firebase_url) ||
    isNotEmpty(googleServicesData.project_info.project_id) ||
    isNotEmpty(googleServicesData.project_info.storage_bucket)
  );
}

function hasBugsnagData() {
  return isNotEmpty(pkg.bugsnag.token);
}

function isNotEmpty(param) {
  return param.trim().length > 0;
}
