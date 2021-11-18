import loginPage from './pages/login';

describe('Login', () => {
  beforeEach(async () => await device.reloadReactNative());

  it('should not login to a test server with wrong credentials', async () => {
    await loginPage.connectToServer();

    await loginPage.logIn('UnknownUser', 'UnknownUserPass');

    await expect(element(by.id('errorMessageInline'))).toExist();
    await expect(element(by.id('errorMessageInlineError'))).toHaveText('Invalid resource owner credentials');
  });

  it('should login to test server', async () => {
    await loginPage.logIn('root', 'root');
    await expect(element(by.id('issue-list-page'))).toExist();
  });
});
