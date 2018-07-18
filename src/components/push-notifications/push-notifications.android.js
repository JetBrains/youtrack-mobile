import log from '../log/log';

log.info('PUSH:not supported on Android');

export async function registerForPush() {
  throw new Error('Not implemented');
}
