const loginPage = require('./pages/login');

describe('Connect&Login', () => {
  beforeEach(async () => {
    await device._fbsimctl._execFbsimctlCommand({args: `${device._simulatorUdid} clear_keychain`});
    await device.relaunchApp({delete: true});
    await device.reloadReactNative();
  });

  it('should connect to test server', async () => {
    await loginPage.connectToServer();
    await expect(element(by.id('youtrack-url'))).toBeVisible();
  });

  it('should not connect to bad server', async () => {
    await loginPage.connectToServer('google.com');
    await expect(element(by.id('error-message')))
      .toHaveText('Invalid server response. The URL is either an unsupported YouTrack version or is not a YouTrack instance. YouTrack Mobile requires YouTrack version 7.0 or later.');
  });

  it('should login to test server', async () => {
    await loginPage.connectToServer();
    await loginPage.logIn();
    await expect(element(by.id('issue-list-page'))).toExist();
  });

  it('should not login to test server with bad credentials', async () => {
    await loginPage.connectToServer();
    await loginPage.logIn('BadUser', 'badpass');
    await expect(element(by.id('error-message')))
      .toHaveText('Invalid resource owner credentials');
  });
});
