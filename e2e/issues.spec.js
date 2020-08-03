const issuesPage = require('./pages/issues');
const loginPage = require('./pages/login');

describe('Issues list', () => {
  beforeAll(async () => {
    await device.launchApp({delete: true});
  });

  beforeAll(async () => {
    await loginPage.connectToServer();
    await loginPage.logIn();

    await expect(element(by.id('issue-list-page'))).toExist();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('search', () => {
    afterEach(async () => {
      await issuesPage.search('');
    });

    it('should search for TP-7', async () => {
      await issuesPage.search('issue id: TP-7');

      await expect(element(by.id('issue-row-summary'))).toHaveText('Wiki examples');
    });

    it('should show `No issues found` error', async () => {
      await issuesPage.search('"Find not existing issues"');

      await expect(element(by.id('error-message'))).toHaveText('No issues found');
    });

    it('should show `Invalid query` error', async () => {
      await issuesPage.search('#{broken search}');

      await expect(element(by.id('error-message'))).toHaveText('Invalid query');
    });
  });
});
