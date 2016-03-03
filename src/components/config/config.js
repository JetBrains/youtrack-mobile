const productionConfig = {
  backendUrl: 'http://ring-demo-dev.labs.intellij.net/youtrack',
  auth: {
    serverUri: 'http://ring-demo-dev.labs.intellij.net/hub',
    clientId: '65ec59d0-8e71-40fd-bcb4-727555eafe07',
    clientSecret: 'AhKqGkZtQpbW',
    scopes: 'Hub YouTrack',
    landingUrl: 'ytoauth://landing.url'
  }
};

module.exports = productionConfig;
