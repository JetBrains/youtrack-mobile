/* @flow */

import RNLocalize from 'react-native-localize';

import {getStorageState} from 'components/storage/storage';
import {format, formatDistanceToNow} from 'date-fns';
import {i18n} from 'components/i18n/i18n';

import deLocale from 'date-fns/locale/de';
import ruLocale from 'date-fns/locale/ru';
import esLocale from 'date-fns/locale/es';
import frLocale from 'date-fns/locale/fr';
import csLocale from 'date-fns/locale/cs';
import heLocale from 'date-fns/locale/he';
import huLocale from 'date-fns/locale/hu';
import jaLocale from 'date-fns/locale/ja';
import koLocale from 'date-fns/locale/ko';
import zhLocale from 'date-fns/locale/zh-CN';
import ptLocale from 'date-fns/locale/pt';
import plLocale from 'date-fns/locale/pl';

import type {Locale} from 'date-fns';
import type {User, UserDateFieldFormat} from 'flow/User';


const DEFAULT_DATE_PATTERN: string = 'd MMM yyyy';
const DEFAULT_DATE_TIME_PATTERN: string = 'd MMM yyyy HH:mm';
const dateLocaleMap: {[key: string]: Locale} = {
  de: deLocale,
  ru: ruLocale,
  es: esLocale,
  fr: frLocale,
  cs: csLocale,
  he: heLocale,
  hu: huLocale,
  ja: jaLocale,
  ko: koLocale,
  zh: zhLocale,
  pt: ptLocale,
  pl: plLocale,
};

function getDeviceLocale(): Locale {
  return RNLocalize.getLocales()[0];
}

function getYTCurrentUser(): ?User {
  return getStorageState().currentUser?.ytCurrentUser;
}

function getLanguage(): ?string {
  return getStorageState().config?.l10n?.language;
}

function isAbsoluteDates(): boolean {
  const currentUser: User = getYTCurrentUser();
  return !!currentUser?.profiles?.appearance?.useAbsoluteDates;
}

function getDateFormatPattern(noTime: boolean = false): string {
  const currentUser: User = getYTCurrentUser();
  const dateFieldFormat: ?UserDateFieldFormat = currentUser?.profiles?.general?.dateFieldFormat;
  let formatPattern: string;
  if (noTime) {
    formatPattern = dateFieldFormat ? dateFieldFormat.datePattern : DEFAULT_DATE_PATTERN;
  } else {
    formatPattern = dateFieldFormat ? dateFieldFormat.pattern : DEFAULT_DATE_TIME_PATTERN;
  }
  return formatPattern;
}

function ytDate(date?: Date | number, noTime?: boolean): string {
  if (date == null) {
    return '';
  }

  const locale: ?Locale = dateLocaleMap[getLanguage()];

  if (isAbsoluteDates()) {
    return format(date, getDateFormatPattern(noTime), {locale});
  }

  if ((Date.now() - date) <= 60 * 1000) {
    return i18n('just now');
  }

  return formatDistanceToNow(date, {addSuffix: true, locale});
}

function absDate(date: Date | number, localeString: ?string): string {
  const utcDate = new Date(date);
  const locale: Array<string> | string = localeString ? [localeString] : getDeviceLocale().languageTag;
  return utcDate.toLocaleTimeString(
    locale, {day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'});
}

export {
  DEFAULT_DATE_PATTERN,
  DEFAULT_DATE_TIME_PATTERN,
  absDate,
  ytDate,
};
