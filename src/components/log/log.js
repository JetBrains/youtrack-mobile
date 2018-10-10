/* @flow */
import deviceLog, {InMemoryAdapter} from 'react-native-device-log';

deviceLog.init(new InMemoryAdapter(), {
  logToConsole : true,
  logRNErrors : true,
  rowInsertDebounceMs: 0,
  maxNumberToRender : 2000,
  maxNumberToPersist : 2000
});

export default {
  log(...params: Array<any>) {
    return deviceLog.log(...params);
  },
  info(...params: Array<any>) {
    return deviceLog.info(...params);
  },
  debug(...params: Array<any>) {
    return deviceLog.debug(...params);
  },
  warn(...params: Array<any>) {
    return deviceLog.error(...params);
  },

  enableLog() {
    deviceLog.options.logToConsole = true;
    deviceLog.log('Logging has been turned on');
  },
  disableLog() {
    deviceLog.options.logToConsole = false;
  }
};
