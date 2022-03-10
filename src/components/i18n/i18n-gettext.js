/* @flow */

import Gettext from 'node-gettext';


export type GetText = {
  on: (eventName: string, callback: Function) => void,
  off: (eventName: string, callback: Function) => void,
  addTranslations: (locale: string, domain: string, translations: Object) => void,
  setLocale: (locale: string) => void,
  setTextDomain: (domain: string) => void,
  gettext: (msgid: string) => string;
  dgettext: (domain: string, msgid: string) => string;
  ngettext: (msgid: string, msgidPlural: string, count) => string;
  dngettext: (domain: string, msgid: string, msgidPlural: string, count: number) => string;
  pgettext: (msgctxt: string, msgid: string) => string;
  dpgettext: (domain: string, msgctxt: string, msgid: string) => string;
  npgettext: (msgctxt: string, msgid: string, msgidPlural: string, count: number) => string;
  dnpgettext: (domain: string, msgctxt: string, msgid: string, msgidPlural: string, count) => string;
  textdomain: () => void,
  setlocale: () => void,
}

export default ((new Gettext()): GetText);

