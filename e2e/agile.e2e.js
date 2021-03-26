import loginPage from './pages/login';

describe('Agile', () => {
  beforeAll(async () => {
    await loginPage.connectToServer();
    await loginPage.logIn();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    await element(by.id('menuAgile')).tap();
  });

  it('should open agile boards', async () => {
    await expect(element(by.id('pageAgile'))).toExist();
  });

});
