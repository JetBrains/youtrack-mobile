import loginPage from './pages/login';
import errorTextMessages from '../src/components/error-message/error-text-messages';

describe('Enter Server', () => {
  const getErrorElement = () => element(by.id('errorMessageInline'));

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show error if connection failed', async () => {
    await loginPage.connectToServer('jetbrains.com');

    await expect(getErrorElement()).toExist();
    await expect(element(by.id('errorMessageInlineError'))).toHaveText(`Invalid server response. The URL is either an unsupported YouTrack version or is not a YouTrack instance. ${errorTextMessages.YT_SUPPORTED_VERSION}`);
  });

  it('should connect to a test server', async () => {
    await loginPage.connectToServer();

    await expect(getErrorElement()).not.toExist();
    await expect(element(by.id('youtrack-url'))).toBeVisible();
  });
});
