/* @flow */

import {gt} from './i18n-gettext';


export function i18n(text: string): string {
  return gt.gettext(text);
}

export function i18nPlural(count: number, text: string, textPlural: string, params): string {
  return gt.ngettext(
    createNgettextMessage(text, params),
    createNgettextMessage(textPlural, params),
    count
  );
}


function createNgettextMessage(message: string, params?: { [p: string]: string | number | undefined } | undefined) {
  let msg: string = message.slice(0);
  if (params) {
    message.replace(/{{([^}]+)}}/g, (pattern: string, key: string) => {
      const _key: string = key.trim();
      if (params.hasOwnProperty(_key)) {
        msg = msg.replace(pattern, params[_key]);
      }
    });
  }
  return msg;
}
