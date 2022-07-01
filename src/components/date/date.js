/* @flow */

import {format, formatDistanceToNow} from 'date-fns';

import {i18n} from 'components/i18n/i18n';
import {getStorageState} from '../storage/storage';

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
import type {User, UserProfileDateFieldFormat} from 'flow/User';

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

const USER_DATE_FORMAT_DEFAULT_PATTERN: string = 'd MMM yyyy HH:mm';
const USER_DATE_FORMAT_DEFAULT_DATE_PATTERN: string = 'd MMM yyyy';

function getYTCurrentUser(): ?User {
  return getStorageState().currentUser?.ytCurrentUser;
}

function getUserProfileDateFieldFormat(): ?UserProfileDateFieldFormat {
  return getYTCurrentUser()?.profiles?.general?.dateFieldFormat;
}

function getPattern() {
  return getUserProfileDateFieldFormat()?.pattern || USER_DATE_FORMAT_DEFAULT_PATTERN;
}

function getDatePattern() {
  return getUserProfileDateFieldFormat()?.datePattern || USER_DATE_FORMAT_DEFAULT_DATE_PATTERN;
}

function getLanguage(): ?string {
  return getStorageState().currentUser?.ytCurrentUser?.profiles?.general?.locale?.language;
}

function isAbsoluteDates(): boolean {
  const currentUser: User = getYTCurrentUser();
  return !!currentUser?.profiles?.appearance?.useAbsoluteDates;
}

function formatDate(date: Date | number, pattern: string = USER_DATE_FORMAT_DEFAULT_PATTERN, locale) {
  return format(date, pattern, {locale});
}

function formatTime(date: Date | number) {
  return format(date, getPattern().split(getDatePattern()).pop().trim());
}

function ytDate(date?: Date | number, noTime?: boolean): string {
  if (date == null) {
    return '';
  }

  const locale: ?Locale = dateLocaleMap[getLanguage()];

  if (isAbsoluteDates()) {
    return formatDate(date, noTime ? getDatePattern() : getPattern(), locale);
  }

  if ((Date.now() - date) <= 60 * 1000) {
    return i18n('just now');
  }

  return formatDistanceToNow(date, {addSuffix: true, locale});
}

export {
  USER_DATE_FORMAT_DEFAULT_DATE_PATTERN,
  USER_DATE_FORMAT_DEFAULT_PATTERN,
  formatTime,
  ytDate,
};
