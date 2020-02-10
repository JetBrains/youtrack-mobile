const loginPage = require('./pages/login');
const errorTextMessages = require('../src/components/error-message/error-text-messages');

describe('Login', () => {
  beforeEach(async () => {
    await device.launchApp({delete: true});
    await device.reloadReactNative();
    await loginPage.connectToServer();
  });

  it('should login to test server', async () => {
    await loginPage.logIn();
    await expect(element(by.id('issue-list-page'))).toExist();
  });

  it('should not login to test server with bad credentials', async () => {
    await loginPage.logIn('UnknownUser', 'UnknownUserPass');

    await expect(element(by.id('errorMessage'))).toHaveText('Invalid resource owner credentials');
    await expect(element(by.id('errorMessageTip'))).toHaveText(errorTextMessages.LOG_IN_2FA_TIP);
    await expect(element(by.id('errorMessageContactSupportLink'))).toExist();
  });
});
