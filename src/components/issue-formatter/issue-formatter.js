/* @flow */
import fromNow from 'from-now';

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

export {getForText, formatDate, relativeDate, shortRelativeDate};
