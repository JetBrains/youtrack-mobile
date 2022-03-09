/* @flow */

import fromNow from 'from-now';
import RNLocalize from 'react-native-localize';

import {i18n} from '../i18n/i18n';

import type {AnyIssue} from 'flow/Issue';
import type {CustomField} from 'flow/CustomFields';

type Locale = {
  languageCode: string,
  scriptCode?: string,
  countryCode: string,
  languageTag: string,
  isRTL: boolean,
};

const justNow: string = i18n('just now');
const translations: { [string]: { 1: string, 2: string } } = {
  'now': justNow,
  'seconds': {
    1: i18n('second'),
    2: i18n('seconds'),
  },
  'minutes': {
    1: i18n('minute'),
    2: i18n('minutes'),
  },
  'hours': {
    1: i18n('hour'),
    2: i18n('hours'),
  },
  'days': {
    1: i18n('day'),
    2: i18n('days'),
  },
  'weeks': {
    1: i18n('week'),
    2: i18n('weeks'),
  },
  'months': {
    1: i18n('month'),
    2: i18n('months'),
  },
  'years': {
    1: i18n('year'),
    2: i18n('years'),
  },
};

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

function relativeDate(date: Date|number): string {
  date = makeDatePast(date);
  const formatted = fromNow(date, translations);
  if (formatted === justNow) {
    return formatted;
  } else {
    return i18n(`{{minutesOrHoursOrDaysOrMonthOrYears}} ago`, {minutesOrHoursOrDaysOrMonthOrYears: formatted});
  }
}

function absDate(date: Date|number, localeString: ?string): string {
  const utcDate = new Date(date);
  const locale: Array<string> | string = localeString ? [localeString] : getDeviceLocale();
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
  absDate,
  formatDate,
  getAssigneeField,
  getEntityPresentation,
  getPriotityField,
  getReadableID,
  getVisibilityPresentation,
  relativeDate,
  ytDate,
};
