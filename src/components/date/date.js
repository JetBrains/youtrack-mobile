/* @flow */

import {format, formatDistanceToNow} from 'date-fns';

import {getStorageState} from '../storage/storage';

import type {User, UserProfileDateFieldFormat} from 'flow/User';


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

function isAbsoluteDates(): boolean {
  const currentUser: User = getYTCurrentUser();
  return !!currentUser?.profiles?.appearance?.useAbsoluteDates;
}

function formatDate(date: Date | number, pattern: string = USER_DATE_FORMAT_DEFAULT_PATTERN) {
  return format(date, pattern);
}

function formatTime(date: Date | number) {
  return format(date, getPattern().split(getDatePattern()).pop().trim());
}

function ytDate(date?: Date | number, noTime?: boolean): string {
  if (date == null) {
    return '';
  }

  if (isAbsoluteDates()) {
    return formatDate(date, noTime ? getDatePattern() : getPattern());
  }

  if ((Date.now() - date) <= 60 * 1000) {
    return 'just now';
  }

  return formatDistanceToNow(date, {addSuffix: true});
}

export {
  USER_DATE_FORMAT_DEFAULT_DATE_PATTERN,
  USER_DATE_FORMAT_DEFAULT_PATTERN,
  formatTime,
  ytDate,
};
