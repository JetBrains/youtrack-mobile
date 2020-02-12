const loginPage = require('./pages/login');
const errorTextMessages = require('../src/components/error-message/error-text-messages');

describe('Login', () => {
  beforeEach(async () => {
    await device.launchApp({delete: true});
    await device.reloadReactNative();

    await loginPage.connectToServer();
  });

  it('should not login to a test server with wrong credentials', async () => {
    await loginPage.logIn('UnknownUser', 'UnknownUserPass');

    await expect(element(by.id('errorMessageInline'))).toExist();
    await expect(element(by.id('errorMessageInlineError'))).toHaveText('Invalid resource owner credentials');
    await expect(element(by.id('errorMessageInlineTip'))).toHaveText(errorTextMessages.LOG_IN_2FA_TIP);
  });

  it('should login to test server', async () => {
    await loginPage.logIn();
    await expect(element(by.id('issue-list-page'))).toExist();
  });
});
