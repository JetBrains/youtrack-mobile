import {Share} from 'react-native';

import deviceLog, {InMemoryAdapter} from 'react-native-device-log';

deviceLog.init(new InMemoryAdapter(), {
  logToConsole: true,
  logRNErrors: true,
  rowInsertDebounceMs: 0,
  maxNumberToRender: 2000,
  maxNumberToPersist: 2000,
});

export default {
  log(...params: unknown[]) {
    return deviceLog.log(...params);
  },

  info(...params: unknown[]) {
    return deviceLog.info(...params);
  },

  debug(...params: unknown[]) {
    return deviceLog.debug(...params);
  },

  warn(...params: unknown[]) {
    return deviceLog.error(...params);
  },

  enableLog() {
    deviceLog.options.logToConsole = true;
    deviceLog.log('Logging has been turned on');
  },

  disableLog() {
    deviceLog.options.logToConsole = false;
  },
};

export async function getLogs(): Promise<string> {
  const rows = await deviceLog.store.getRows();
  return rows
    .reverse() // They store comments in reverse order
    .map((row: { timeStamp: Record<any, any>, message: string }) => `${row.timeStamp._i}: ${row.message}`)
    .join('\n');
}

export async function copyRawLogs() {
  const logs = await getLogs();
  Share.share({
    message: logs,
  });
}
