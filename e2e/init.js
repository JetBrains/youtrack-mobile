const detox = require('detox');
const config = require('../package.json').detox;

const adapter = require('detox/runners/jest/adapter');
const streamlineReporter = require('detox/runners/jest/streamlineReporter');

jasmine.getEnv().addReporter(adapter);
jasmine.getEnv().addReporter(streamlineReporter);


const JEST_DEFAULT_TIMEOUT = process.env.jetsTimeout || 120000;
jest.setTimeout(JEST_DEFAULT_TIMEOUT);

beforeAll(async () => {
  await detox.init(config);
});

afterAll(async () => {
  await adapter.afterAll();
  await detox.cleanup();
});

beforeEach(async () => {
  await adapter.beforeEach();
});

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason); //eslint-disable-line
});
