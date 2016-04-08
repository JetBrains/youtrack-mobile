const productionConfig = {
  backendUrl: process.env.npm_package_config_backend_uri,
  auth: {
    serverUri: process.env.npm_package_config_hub_server_uri,
    clientId: process.env.npm_package_config_client_id,
    clientSecret: process.env.npm_package_config_client_secret,
    scopes: 'Hub YouTrack',
    landingUrl: 'ytoauth://landing.url'
  }
};

console.log('config', productionConfig)

module.exports = productionConfig;
