import {format, formatDistanceToNow, startOfDay} from 'date-fns';

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
import itLocale from 'date-fns/locale/it';
import ukLocale from 'date-fns/locale/uk';

import {i18n, i18nPlural} from 'components/i18n/i18n';
import {getStorageState} from 'components/storage/storage';

import type {Locale} from 'date-fns';
import type {User, UserProfileDateFieldFormat} from 'types/User';

const dateLocaleMap: Record<string, Locale> = {
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
  it: itLocale,
  uk: ukLocale,
};
const DEFAULT_TIME_PATTERN: string = 'HH:mm';
const USER_DATE_FORMAT_DEFAULT_PATTERN: string = 'd MMM yyyy HH:mm';
const USER_DATE_FORMAT_DEFAULT_DATE_PATTERN: string = 'd MMM yyyy';

function getYTCurrentUser(): User | null | undefined {
  return getStorageState().currentUser?.ytCurrentUser;
}

function getUserProfileDateFieldFormat():
  | UserProfileDateFieldFormat
  | null
  | undefined {
  return getYTCurrentUser()?.profiles?.general?.dateFieldFormat;
}

function getPattern() {
  return (
    getUserProfileDateFieldFormat()?.pattern || USER_DATE_FORMAT_DEFAULT_PATTERN
  );
}

function getDatePattern() {
  return (
    getUserProfileDateFieldFormat()?.datePattern ||
    USER_DATE_FORMAT_DEFAULT_DATE_PATTERN
  );
}

function getLanguage(): string {
  return (
    getStorageState().currentUser?.ytCurrentUser?.profiles?.general?.locale
      ?.language || ''
  );
}

function isAbsoluteDates(): boolean {
  const currentUser: User | null | undefined = getYTCurrentUser();
  return !!currentUser?.profiles?.appearance?.useAbsoluteDates;
}

function formatDate(
  date: Date | number,
  pattern: string = USER_DATE_FORMAT_DEFAULT_PATTERN,
  locale: Locale,
) {
  return format(date, pattern, {
    locale,
  });
}

function formatTime(date: Date | number): string {
  return format(date, (getPattern().split(getDatePattern()).pop() || '').trim());
}

function toStartOfDayTimeString(date: Date | number): string {
  return format(startOfDay(date), DEFAULT_TIME_PATTERN);
}

function toTimeString(date: Date | number): string {
  return format(date, DEFAULT_TIME_PATTERN);
}

function getLocale() {
  return dateLocaleMap[getLanguage()];
}

function absDate(date?: Date | number, noTime?: boolean): string {
  return date == null
    ? ''
    : formatDate(date, noTime ? getDatePattern() : getPattern(), getLocale());
}

function ytDate(date?: number, noTime?: boolean): string {
  if (date == null) {
    return '';
  }
  return isAbsoluteDates() ? absDate(date, noTime) : ytDateRelative(date);
}

function getFormattedDate(d: Date, pattern: string) {
  const locale = getLocale();
  return format(d, pattern, {locale: locale});
}

function ytDateRelative(date: number): string {
  return Date.now() - date <= 60 * 1000
    ? i18n('just now')
    : formatDistanceToNow(date, {
        addSuffix: true,
        locale: getLocale(),
      });
}

function formatSLADistanceToBreach(date: number): string {
  const minutesLeft = Math.floor((date - Date.now()) / 1000 / 60);
  const minutesAbsolute = Math.abs(minutesLeft);
  if (minutesAbsolute < 90) {
    return i18nPlural(
      minutesAbsolute,
      '{{minutesAbsolute}}m',
      '{{minutesAbsolute}}m',
      {minutesAbsolute},
    );
  }
  const hoursLeft = Math.floor(minutesAbsolute / 60);
  if (hoursLeft < 24) {
    return i18nPlural(
      hoursLeft,
      '{{hoursLeft}}h',
      '{{hoursLeft}}h',
      {hoursLeft},
    );
  }
  const daysLeft = Math.floor(hoursLeft / 24);
  return i18nPlural(
    daysLeft,
    '{{daysLeft}}d',
    '{{daysLeft}}d',
    {daysLeft},
  );
}

export {
  USER_DATE_FORMAT_DEFAULT_DATE_PATTERN,
  USER_DATE_FORMAT_DEFAULT_PATTERN,
  absDate,
  formatTime,
  formatSLADistanceToBreach,
  toStartOfDayTimeString,
  toTimeString,
  ytDate,
  ytDateRelative,
  getFormattedDate,
};
