var productionConfig = {
  backendUrl: 'http://ring-demo-dev.labs.intellij.net/youtrack',
  auth: {
    serverUri: 'http://ring-demo-dev.labs.intellij.net/hub',
    clientId: '69d0af0d-afa5-4e4d-a77f-c1523db0d073',
    clientSecret: 'wKQriy4XMgdR',
    scopes: 'Hub YouTrack',
    landingUrl: 'ytoauth://landing.url'
  }
};

module.exports = productionConfig;
