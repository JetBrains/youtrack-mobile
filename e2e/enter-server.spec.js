const loginPage = require('./pages/login');
const errorTextMessages = require('../src/components/error-message/error-text-messages');

describe('Enter Server', () => {
  beforeEach(async () => {
    await device.launchApp({delete: true});
    await device.reloadReactNative();
  });

  it('should connect to a test server', async () => {
    await loginPage.connectToServer();
    await expect(element(by.id('youtrack-url'))).toBeVisible();
  });

  it('should show error if connection failed', async () => {
    await loginPage.connectToServer('jetbrains.com');

    await expect(element(by.id('errorMessageInline'))).toExist();
    await expect(element(by.id('errorMessageInlineError')))
      .toHaveText(`Invalid server response. The URL is either an unsupported YouTrack version or is not a YouTrack instance. ${errorTextMessages.YT_SUPPORTED_VERSION}`);
  });

});
