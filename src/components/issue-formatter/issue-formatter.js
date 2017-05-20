/* @flow */
import fromNow from 'from-now';
import type {IssueUser, CustomField} from '../../flow/CustomFields';
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

function getForText(assignee: IssueUser | Array<IssueUser>) {
  if (Array.isArray(assignee) && assignee.length > 0) {
    return assignee
      .map(it => getForText(it))
      .join(', ');
  }
  if (assignee && !Array.isArray(assignee)) {
    return `for ${assignee.fullName || assignee.login}`;
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

function shortRelativeDate(date: Date|number) {
  date = makeDatePast(date);
  const formatted = fromNow(date, shortRelativeFormat);
  return `${formatted}${getPostfix(formatted)}`;
}

function findIssueField(issue: AnyIssue, predicate: (field: CustomField) => boolean) {
  const fields: Array<CustomField> = issue.fields;

  for (const field of fields) {
    if (predicate(field)) {
      return field;
    }
  }

  return null;
}

function getPriotityField(issue: AnyIssue) {
  const PRIORITY_FIELDS = ['Priority'];
  return findIssueField(issue, field => {
    const fieldName = field.projectCustomField.field.name;
    return PRIORITY_FIELDS.includes(fieldName);
  });
}

function getAssigneeField(issue: AnyIssue) {
  const PRIORITY_FIELDS = ['Assignee', 'Assignees'];
  return findIssueField(issue, field => {
    const fieldName = field.projectCustomField.field.name;
    return PRIORITY_FIELDS.includes(fieldName);
  });
}

function getReadableID(issue: AnyIssue) {
  return `${issue.project.shortName}-${issue.numberInProject}`;
}


export {getForText, formatDate, relativeDate, shortRelativeDate, getPriotityField, getAssigneeField, getReadableID};
