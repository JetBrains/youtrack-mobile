/* @flow */

import {getStorageState} from '../storage/storage';
import {format, formatDistanceToNow} from 'date-fns';

import type {User, UserDateFieldFormat} from '../../flow/User';


const DEFAULT_DATE_PATTERN: string = 'd MMM yyyy';
const DEFAULT_DATE_TIME_PATTERN: string = 'd MMM yyyy HH:mm';

function getYTCurrentUser(): ?User {
  return getStorageState().currentUser?.ytCurrentUser;
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

  if (isAbsoluteDates()) {
    return format(date, getDateFormatPattern(noTime));
  }

  if ((Date.now() - date) <= 60 * 1000) {
    return 'just now';
  }

  return formatDistanceToNow(date, {addSuffix: true});
}

export {
  DEFAULT_DATE_PATTERN,
  DEFAULT_DATE_TIME_PATTERN,
  ytDate,
};
