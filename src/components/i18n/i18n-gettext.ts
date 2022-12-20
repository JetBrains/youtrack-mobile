import Gettext from 'node-gettext';
export type GetText = {
  on: (eventName: string, callback: (...args: Array<any>) => any) => void;
  off: (eventName: string, callback: (...args: Array<any>) => any) => void;
  addTranslations: (
    locale: string,
    domain: string,
    translations: Record<string, any>,
  ) => void;
  setLocale: (locale: string) => void;
  setTextDomain: (domain: string) => void;
  gettext: (msgid: string) => string;
  dgettext: (domain: string, msgid: string) => string;
  ngettext: (msgid: string, msgidPlural: string, arg2: count) => string;
  dngettext: (
    domain: string,
    msgid: string,
    msgidPlural: string,
    count: number,
  ) => string;
  pgettext: (msgctxt: string, msgid: string) => string;
  dpgettext: (domain: string, msgctxt: string, msgid: string) => string;
  npgettext: (
    msgctxt: string,
    msgid: string,
    msgidPlural: string,
    count: number,
  ) => string;
  dnpgettext: (
    domain: string,
    msgctxt: string,
    msgid: string,
    msgidPlural: string,
    arg4: count,
  ) => string;
  textdomain: () => void;
  setlocale: () => void;
};
export default new Gettext() as GetText;