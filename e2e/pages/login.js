const SERVER_URL = 'http://127.0.0.1:8088';
const DEFAULT_LOGIN = 'root';
const DEFAULT_PASS = 'root';

const LOGIN_INPUT = 'login-input';
const PASS_INPUT = 'password-input';

module.exports = {
  connectToServer: async (serverUrl = SERVER_URL) => {
    await element(by.id('server-url')).tap();
    await element(by.id('server-url')).typeText(serverUrl);
    await element(by.id('next')).tap();
  },

  logIn: async (login = DEFAULT_LOGIN, pass = DEFAULT_PASS) => {
    await element(by.id(LOGIN_INPUT)).tap();
    await element(by.id(LOGIN_INPUT)).replaceText(login);

    await element(by.id(PASS_INPUT)).tap();
    await element(by.id(PASS_INPUT)).replaceText(pass);
    await element(by.id('log-in')).tap();
  }
};
