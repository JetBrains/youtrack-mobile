/* @flow */

import fromNow from 'from-now';
import RNLocalize from 'react-native-localize';

import type {CustomField} from '../../flow/CustomFields';
import type {User} from '../../flow/User';
import type {AnyIssue} from '../../flow/Issue';

type Locale = {
  languageCode: string,
  scriptCode?: string,
  countryCode: string,
  languageTag: string,
  isRTL: boolean,
};

const shortRelativeFormat = {
  'now': 'just now',
  'seconds': ['sec', 'sec'],
  'minutes': ['min', 'min'],
  'hours': ['hr', 'hr'],
  'days': ['d', 'd'],
  'weeks': ['w', 'w'],
  'months': ['mon', 'mon'],
  'years': ['y', 'y'],
};

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

/**
 * fromNow does not format date if it is not past. But such situation could happen if there are a little time shift on server/client.
 */
function makeDatePast(date: Date|number) {
  const dateObj = new Date(date);
  if (dateObj.getTime() >= Date.now()) {
    return Date.now();
  }

  return date;
}

function getDeviceLocale(): string {
  const locales: Array<Locale> = RNLocalize.getLocales();
  return locales[0] && locales[0].languageTag;
}

function formatDate(date: Date|number): string {
  const dateObj = new Date(date);
  return `${dateObj.toLocaleString(getDeviceLocale(), {year: '2-digit', month: 'short', day: '2-digit', hour: '2-digit', minute:'2-digit'})}`;
}

function ytDate(date: Date | number, noTime: boolean = false): string {
  const dateObj = new Date(date);
  //$FlowFixMe
  return `${dateObj.toLocaleString(getDeviceLocale(), Object.assign(
    {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    },
    noTime ? {} : {
      hour: '2-digit',
      minute: '2-digit',
    }
  ))}`;
}

function getPostfix(formattedDate: string) {
  return formattedDate === 'just now' ? '' : ' ago';
}

function relativeDate(date: Date|number): string {
  date = makeDatePast(date);
  const formatted = fromNow(date, {now: 'just now'});
  return `${formatted}${getPostfix(formatted)}`;
}

function absDate(date: Date|number, localeString: ?string): string {
  const utcDate = new Date(date);
  const locale: Array<string> | string = localeString ? [localeString] : getDeviceLocale();
  return utcDate.toLocaleTimeString(locale, {day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'});
}

function shortRelativeDate(date: Date|number): string {
  date = makeDatePast(date);
  const formatted = fromNow(date, shortRelativeFormat);
  return `${formatted}${getPostfix(formatted)}`;
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
  getForText, formatDate, relativeDate, shortRelativeDate, getPriotityField, getAssigneeField, getReadableID,
  getVisibilityPresentation, getEntityPresentation, absDate, ytDate,
};
