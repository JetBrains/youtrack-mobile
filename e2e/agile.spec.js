const loginPage = require('./pages/login');

describe('Agile', () => {
  beforeAll(async () => {
    await device.launchApp({delete: true});
  });

  beforeAll(async () => {
    await loginPage.connectToServer();
    await loginPage.logIn();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  beforeEach(async () => {
    await element(by.id('header-back')).tap();
    await expect(element(by.id('pageAgileBoards'))).toExist();
  });

  it('should open agile boards', async () => {
    await element(by.id('pageAgileBoards')).tap();
    await expect(element(by.id('pageAgile'))).toExist();
  });

});
