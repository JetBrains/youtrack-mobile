/* @flow */
import deviceLog from 'react-native-device-log';

let logEnabled = true;

deviceLog.init(null, {
    logToConsole : true,
    logRNErrors : true,
    maxNumberToRender : 2000,
    maxNumberToPersist : 2000
});

export default {
  log(...params: Array<any>) {
    if (!logEnabled) {
      return;
    }
    return deviceLog.log(...params);
  },
  info(...params: Array<any>) {
    if (!logEnabled) {
      return;
    }
    return deviceLog.info(...params);
  },
  warn(...params: Array<any>) {
    if (!logEnabled) {
      return;
    }
    return deviceLog.warn(...params);
  },

  enableLog() {
    deviceLog.log('Logging has been turned on');
    logEnabled = true;
  },
  disableLog() {
    logEnabled = false;
  }
};
