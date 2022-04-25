/* @flow */

import RNLocalize from 'react-native-localize';
import {format, formatDistanceToNow} from 'date-fns';

import BaseAPI from '../api/api__base';

import type {AnyIssue} from 'flow/Issue';
import type {CustomField} from 'flow/CustomFields';
import type {User, UserDateFieldFormat} from 'flow/User';

type Locale = {
  languageCode: string,
  scriptCode?: string,
  countryCode: string,
  languageTag: string,
  isRTL: boolean,
};

export const DEFAULT_DATE_PATTERN: string = 'd MMM yyyy';
export const DEFAULT_DATE_TIME_PATTERN: string = 'd MMM yyyy HH:mm';


function getForText(assignee: User | Array<User>): string {
  if (Array.isArray(assignee) && assignee.length > 0) {
    return assignee
      .map(it => getForText(it))
      .join(', ');
  }
  if (assignee && !Array.isArray(assignee)) {
    return `for ${getEntityPresentation(assignee)}`;
  }
  return '    Unassigned';
}

function getDeviceLocale(): Locale {
  return RNLocalize.getLocales()[0];
}

function isAbsoluteDates(): boolean {
  const currentUser: User = BaseAPI.getUser();
  return !!currentUser?.profiles?.appearance?.useAbsoluteDates;
}

function getDateFormatPattern(noTime: boolean = false): string {
  const currentUser: User = BaseAPI.getUser();
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

function absDate(date: Date|number, localeString: ?string): string {
  const utcDate = new Date(date);
  const locale: Array<string> | string = localeString ? [localeString] : getDeviceLocale().languageTag;
  return utcDate.toLocaleTimeString(locale, {day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'});
}

function findIssueField(issue: AnyIssue, predicate: (field: CustomField) => boolean): ?CustomField {
  const fields: Array<CustomField> = issue.fields || [];

  for (const field of fields) {
    if (predicate(field)) {
      return field;
    }
  }

  return null;
}

function getPriotityField(issue: AnyIssue): ?CustomField {
  return findIssueField(issue, field => {
    const fieldName: ?string = field?.projectCustomField?.field?.name;
    return !!fieldName && fieldName.toLowerCase() === 'priority';
  });
}

function getAssigneeField(issue: AnyIssue): ?CustomField {
  const PRIORITY_FIELDS = ['Assignee', 'Assignees'];
  return findIssueField(issue, field => {
    const fieldName = field.projectCustomField.field.name;
    return PRIORITY_FIELDS.includes(fieldName);
  });
}

function getReadableID(issue: AnyIssue): string {
  return !!issue && (issue.idReadable || issue.id) || '';
}

function getEntityPresentation(entity: Object): any | string {
  let userName: string = '';
  if (entity) {
    if (!entity.ringId) {
      userName = entity.name || entity.userName || entity.login;
    }
    if (!userName) {
    userName = entity.fullName || entity.localizedName || entity.name || entity.login || entity.presentation || entity.text;
    }
  }
  return userName || '';
}

function getVisibilityPresentation(entity: Object): null | string {
  if (!entity) {
    return null;
  }

  const visibility = entity.visibility || {};
  return (
    [].concat(visibility.permittedGroups || [])
      .concat(visibility.permittedUsers || [])
      .map(it => getEntityPresentation(it))
      .join(', ')
  );
}

export {
  getForText,
  getPriotityField,
  getAssigneeField,
  getReadableID,
  getVisibilityPresentation,
  getEntityPresentation,
  absDate,
  ytDate,
};
