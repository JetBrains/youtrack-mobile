require('babel-polyfill');
const detox = require('detox');
const config = require('../package.json').detox;

before(() => {
  return detox.init(config);
});

after(() => {
  return detox.cleanup();
});
