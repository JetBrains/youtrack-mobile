
if (!isDefaultDevConfigAndVersion()) {
  throw new Error('package.json:: Config or Version is touched. Revert changes and proceed.');
}

function isDefaultDevConfigAndVersion() {
  const pkg = require('../package.json');
  return pkg.version === '0.1.0-0' &&
    pkg.config.KONNECTOR_URL === 'https://konnector-staging.services.jetbrains.com' &&
    pkg.config.ANALYTICS_ID === '' &&
    pkg.config.EXCEPTION_REPORTER_TOKEN === '';
}

