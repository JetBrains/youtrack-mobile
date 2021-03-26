import issuesPage from './pages/issues';
import loginPage from './pages/login';

describe('Issues view', () => {
  beforeAll(async () => {
    await loginPage.connectToServer();
    await loginPage.logIn();
  });

  beforeEach(async () => {
    await device.reloadReactNative();

    await issuesPage.search('issue id: TP-7');
    await element(by.id('issue-row')).tap();
  });

  it('should open issue', async () => {
    await expect(element(by.id('issue-view'))).toExist();
    await expect(element(by.id('issue-summary'))).toHaveText('Wiki examples');
    await expect(element(by.id('issue-id'))).toHaveText('TP-7');
  });

});
