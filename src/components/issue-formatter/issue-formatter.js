/* @flow */
import fromNow from 'from-now';
import type {CustomField} from '../../flow/CustomFields';
import type {User} from '../../flow/User';
import type {AnyIssue} from '../../flow/Issue';

const shortRelativeFormat = {
  'now': 'just now',
  'seconds': ['sec', 'sec'],
  'minutes': ['min', 'min'],
  'hours': ['hr', 'hr'],
  'days': ['d', 'd'],
  'weeks': ['w', 'w'],
  'months': ['mon', 'mon'],
  'years': ['y', 'y']
};

function getForText(assignee: User | Array<User>) {
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

function formatDate(date: Date|number) {
  const dateObj = new Date(date);
  return `${dateObj.toLocaleString([], {year: '2-digit', month: 'short', day: '2-digit', hour: '2-digit', minute:'2-digit'})}`;
}

function getPostfix(formattedDate: string) {
  return formattedDate === 'just now' ? '' : ' ago';
}

function relativeDate(date: Date|number) {
  date = makeDatePast(date);
  const formatted = fromNow(date, {now: 'just now'});
  return `${formatted}${getPostfix(formatted)}`;
}

function absDate(date: Date|number, localeString: ?string) {
  const utcDate = new Date(date);
  const _locales = localeString ? [localeString] : [];
  return utcDate.toLocaleTimeString(_locales, {day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'});
}

function shortRelativeDate(date: Date|number) {
  date = makeDatePast(date);
  const formatted = fromNow(date, shortRelativeFormat);
  return `${formatted}${getPostfix(formatted)}`;
}

function findIssueField(issue: AnyIssue, predicate: (field: CustomField) => boolean): ?CustomField {
  const fields: Array<CustomField> = issue.fields;

  // eslint-disable-next-line no-unused-vars
  for (const field of fields) {
    if (predicate(field)) {
      return field;
    }
  }

  return null;
}

function getPriotityField(issue: AnyIssue): ?CustomField {
  return findIssueField(issue, field => {
    const fieldName = field.projectCustomField.field.name;
    return fieldName.toLowerCase() === 'priority';
  });
}

function getAssigneeField(issue: AnyIssue): ?CustomField {
  const PRIORITY_FIELDS = ['Assignee', 'Assignees'];
  return findIssueField(issue, field => {
    const fieldName = field.projectCustomField.field.name;
    return PRIORITY_FIELDS.includes(fieldName);
  });
}

function getReadableID(issue: AnyIssue) {
  return `${issue.idReadable || issue.id}`;
}

function getEntityPresentation(entity: Object) {
  if (!entity) {
    return '';
  }

  return entity.fullName || entity.localizedName || entity.name || entity.login || entity.presentation || entity.text || '';
}

function getVisibilityPresentation(entity: Object) {
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
  getVisibilityPresentation, getEntityPresentation, absDate
};
