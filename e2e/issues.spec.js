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

    it('should show "no issues found"', async () => {
      await issuesPage.search('100%notexistingquery');

      await expect(element(by.id('no-issues'))).toExist();
    });

    it('should show search error message', async () => {
      await issuesPage.search('#{broken search}');

      await expect(element(by.id('error-message'))).toExist();
    });
  });
});
