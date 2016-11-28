/* @flow */

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

export {getForText};
