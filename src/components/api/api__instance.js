import log from '../log/log';
import type Api from './api';

let api = null;

export function setApi(newApi?: Api) {
  log.debug(newApi ? `New API instance received (${newApi.youTrackIssueUrl})` : 'API instance destroyed');
  api = newApi;
}

export function getApi(): Api {
  if (!api) {
    throw new Error('Trying to use API until it is initialized in store');
  }
  return api;
}
