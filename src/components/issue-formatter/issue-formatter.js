/* @flow */
import fromNow from 'from-now';

const shortRelativeFormat = {
  'now': 'now',
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

function formatDate(date: Date|number) {
  const dateObj = new Date(date);
  return `${dateObj.toLocaleString([], {year: '2-digit', month: 'short', day: '2-digit', hour: '2-digit', minute:'2-digit'})}`;
}

function relativeDate(date: Date|number) {
  return `${fromNow(date)} ago`;
}

function shortRelativeDate(date: Date|number) {
  return `${fromNow(date, shortRelativeFormat)} ago`;
}

export {getForText, formatDate, relativeDate, shortRelativeDate};
