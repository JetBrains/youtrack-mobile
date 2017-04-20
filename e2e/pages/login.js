const SERVER_URL = 'ytm-test.myjetbrains.com';
const DEFAULT_LOGIN = 'TestYTM';
const DEFAULT_PASS = 'TestYTM';

const LOGIN_INPUT = 'login-input';
const PASS_INPUT = 'password-input';

module.exports = {
  connectToServer: () => {
    return element(by.id('server-url')).tap()
      .then(() => element(by.id('server-url')).typeText(SERVER_URL))
      .then(() => element(by.id('next')).tap())
  },

  logIn: (login = DEFAULT_LOGIN, pass = DEFAULT_PASS) => {
    return element(by.id(LOGIN_INPUT)).tap()
      .then(() => element(by.id(LOGIN_INPUT)).replaceText(login))
      .then(() => element(by.id(PASS_INPUT)).tap())
      .then(() => element(by.id(PASS_INPUT)).replaceText(pass))
      .then(() => element(by.id('log-in')).tap());
  }
};
