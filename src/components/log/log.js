/* @flow */
/*eslint-disable no-console*/
const logEnabled = true;

export default {
  log(...params: Array<any>) {
    if (!logEnabled) {
      return;
    }
    return console.log(...params);
  },
  info(...params: Array<any>) {
    if (!logEnabled) {
      return;
    }
    return console.info(...params);
  },
  warn(...params: Array<any>) {
    if (!logEnabled) {
      return;
    }
    return console.warn(...params);
  }
};
