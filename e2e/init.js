const detox = require('detox');
const config = require('../package.json').detox;

const JEST_DEFAULT_TIMEOUT = process.env.jetsTimeout || 120000;
jest.setTimeout(JEST_DEFAULT_TIMEOUT);
console.log('Jest default timeout is', JEST_DEFAULT_TIMEOUT); //eslint-disable-line

beforeAll(async () => {
  await detox.init(config);
});

afterAll(async () => {
  await detox.cleanup();
});
