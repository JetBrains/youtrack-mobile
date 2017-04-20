const loginPage = require('./pages/login');

describe('Login', () => {
  beforeEach(() => {
    return device.reloadReactNative();
  });

  it('should connect to test server', () => {
    return loginPage.connectToServer()
      .then(() => expect(element(by.id('youtrack-url'))).toBeVisible());
  });

  it('should login to test server', () => {
    return loginPage.logIn()
      .then(() => expect(element(by.id('issue-list-page'))).toExist());
  });
});
