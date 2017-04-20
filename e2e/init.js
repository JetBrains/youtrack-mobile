require('babel-polyfill');
const detox = require('detox');
const config = require('../package.json').detox;

before(async () => {
  await detox.init(config);
});

beforeEach(async () => {
  await device._fbsimctl._execFbsimctlCommand({args: `${device._simulatorUdid} clear_keychain`});
  await device.relaunchApp({delete: true});
});

after(async () => {
  await detox.cleanup();
  // await device.shutdown();
});
