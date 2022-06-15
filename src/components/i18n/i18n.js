/* @flow */

import gt from './i18n-gettext';
import log from 'components/log/log';

interface Params {
  [p: string]: string | number;
}


export function i18n(text: string = '', params?: Params): string {
  return createGettextMessage(gt.gettext(text), params);
}

export function i18nPlural(count: number, text: string, textPlural: string, params?: Params): string {
  return createGettextMessage(gt.ngettext(text, textPlural, count), params);
}


function createGettextMessage(message: string, params?: Params) {
  let msg: string = message.slice(0);
  if (params) {
    msg.replace(/{{([^}]+)}}/g, (match: string, paramKey: string): string => {
      const key: string = paramKey.trim();
      if (params.hasOwnProperty(key)) {
        msg = msg.replace(match, params[key]);
      } else {
        log.warn('Interpolation parameter is required');
      }
    });
  }
  return msg;
}
