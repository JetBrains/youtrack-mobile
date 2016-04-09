const config = {
  backendUrl: process.env.npm_package_config_backend_uri,
  auth: {
    serverUri: null,
    clientId: null,
    clientSecret: null,
    scopes: 'Hub YouTrack',
    landingUrl: 'ytoauth://landing.url'
  }
};

function loadConfig(ytUrl = config.backendUrl) {
  return fetch(`${ytUrl}/api/config?fields=ring(url),mobile(serviceSecret,serviceId)`)
    .then(res => res.json())
    .then(res => {
      if (!res.mobile.serviceId) {
        throw new Error(`${ytUrl} does not have mobile application feature turned on. Check the documentation.`);
      }
      Object.assign(config.auth, {
        serverUri: res.ring.url,
        clientId: res.mobile.serviceId,
        clientSecret: res.mobile.serviceSecret
      });

      return config;
    });
}

export {loadConfig};

export default config;
